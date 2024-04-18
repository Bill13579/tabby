mod utils;
mod frozen_token;

use frozen_token::{ToFrozenToken, FrozenToken};
use lazy_static::lazy_static;
use std::{collections::{HashMap, HashSet}, convert::TryInto, str::Chars, iter::Rev, sync::{Mutex, MutexGuard, Arc}, cell::RefCell};
use charabia::{Tokenize, Token};
use fancy_regex::{Regex, Captures, CaptureMatches, Match};
use unicode_segmentation::UnicodeSegmentation;
use url::{Url, Host, Position};

use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize)]
pub struct Update {
    pub stats: Option<Statistics>,
    pub doc: Option<Document>
}

#[derive(Serialize, Deserialize)]
pub struct Statistics {
    pub totalDocs: u64,
    pub lengthAvg: f64,
    pub occurences: HashMap<String, u64>
}
//{totalDocs: 0, lengthAvg: 0, occurences: {}}

impl Statistics {
    pub fn add(&mut self, doc: &Document) {
        self.totalDocs += 1;
        self.lengthAvg *= (self.totalDocs-1) as f64 / self.totalDocs as f64;
        let mut done_set = HashSet::new();
        for part in &doc.parts {
            self.lengthAvg += part.text.len() as f64 / self.totalDocs as f64;
            for (key, _) in &part.occurences {
                if !done_set.contains(key) {
                    *self.occurences.entry(key.clone()).or_insert(0) += 1;
                    done_set.insert(key.clone());
                }
            }
        }
    }
    pub fn sub(&mut self, doc: &Document) {
        if self.totalDocs == 0 {
            return;
        }
        if self.totalDocs != 1 {
            self.lengthAvg *= self.totalDocs as f64 / (self.totalDocs-1) as f64;
        } else {
            self.lengthAvg = 0.0;
        }
        let mut done_set = HashSet::new();
        for part in &doc.parts {
            if self.totalDocs != 1 {
                self.lengthAvg -= part.text.len() as f64 / (self.totalDocs-1) as f64;
            }
            for (key, _) in &part.occurences {
                if !done_set.contains(key) {
                    if let Some(old_val) = self.occurences.get(key) {
                        if old_val - 1 == 0 {
                            // Remove the key from the map if they don't occur in any documents at all to avoid
                            //  muddying the IDF calculations
                            self.occurences.remove(key);
                        } else {
                            self.occurences.insert(key.clone(), old_val - 1);
                        }
                    }
                    done_set.insert(key.clone());
                }
            }
        }
        self.totalDocs -= 1;
    }
    pub fn idf_str(&self, q: &str) -> f64 {
        let documents_containing_q;
        if let Some(c) = self.occurences.get(q) {
            documents_containing_q = *c;
        } else {
            documents_containing_q = self.totalDocs;
        }
        ((self.totalDocs as f64 - documents_containing_q as f64 + 0.5) / (documents_containing_q as f64 + 0.5) + 1.0).ln()
    }
    pub fn idf_strs<'a, I>(&self, qs: I) -> f64
    where I: Iterator<Item = &'a String> {
        let mut idf = 0.0;
        for q in qs {
            idf += self.idf_str(q);
        }
        idf
    }
    pub fn idf_word(&self, q: &FrozenToken) -> f64 {
        self.idf_str(q.lemma())
    }
    pub fn idf_words(&self, qs: &[FrozenToken]) -> f64 {
        let mut idf = 0.0;
        for q in qs {
            idf += self.idf_word(q);
        }
        idf
    }
}

#[derive(Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub parts: Vec<DocumentPart>,
    pub approx_bytes_used: Option<usize>
}

impl Document {
    pub fn score(&self, query: &Query, stats: &Statistics) -> (Score, Vec<(PartType, QueryResult)>) {
        let mut sum = Score::zero();
        let mut query_results = Vec::new();
        for part in &self.parts {
            let (mut part_score, query_result) = query.score(part, stats);
            //TODO: Adjust weights
            match part.t {
                PartType::TITLE => part_score.weight(1.0),
                PartType::URL => part_score.weight(1.0),
                PartType::CONTENT => part_score.weight(1.2),
            }
            sum.add(&part_score);
            query_results.push((part.t, query_result));
        }
        (sum, query_results)
    }
}

#[derive(Serialize, Deserialize, Copy, Clone)]
pub enum PartType {
    TITLE,
    URL,
    CONTENT
}

#[derive(Serialize, Deserialize)]
pub struct DocumentPart {
    pub t: PartType,
    pub totalWords: u64,
    pub totalChars: usize,
    pub text: String,
    pub occurences: HashMap<String, Vec<u64>>
}

#[derive(Serialize, Deserialize)]
pub struct Score {
    pub tf: f64,
    pub idf: f64
}
impl Score {
    pub fn zero() -> Score {
        Score {
            tf: 0.0,
            idf: 0.0
        }
    }
    pub fn add(&mut self, other: &Score) {
        self.tf += other.tf;
        self.idf += other.idf;
    }
    pub fn weight(&mut self, multiplier: f64) {
        self.tf *= multiplier;
        self.idf *= multiplier;
    }
    pub fn calculate(&self) -> f64 {
        self.tf * self.idf
    }
}

#[derive(Serialize, Deserialize)]
pub enum QueryResultType {
    GROUP,
    SINGLE_QUERY
}

#[derive(Serialize, Deserialize)]
pub struct QueryResult {
    pub t: QueryResultType,
    pub results: Option<Vec<QueryResult>>,
    pub matches: Option<Vec<QueryMatch>>
}
impl QueryResult {
    pub fn new_group(results: Vec<QueryResult>) -> QueryResult {
        QueryResult { t: QueryResultType::GROUP, results: Some(results), matches: None }
    }
    pub fn new_single_query(matches: Vec<QueryMatch>) -> QueryResult {
        QueryResult { t: QueryResultType::SINGLE_QUERY, results: None, matches: Some(matches) }
    }
}
#[derive(Serialize, Deserialize)]
pub struct QueryMatch {
    pub results: Vec<QueryMatch>,
    pub matches: Vec<QueryMatchPart>,
    pub common_value: Option<String>
}
impl QueryMatch {
    pub fn new(matches: Vec<QueryMatchPart>) -> QueryMatch {
        QueryMatch { results: Vec::new(), matches, common_value: None }
    }
    pub fn new_with_common_value(matches: Vec<QueryMatchPart>, common_value: String) -> QueryMatch {
        QueryMatch { results: Vec::new(), matches, common_value: Some(common_value) }
    }
    pub fn from_captures(regex: &Regex, captures: CaptureMatches) -> QueryResult {
        let mut query_results: Vec<QueryMatch> = Vec::new();
        for cap in captures {
            let mut query_matches: Vec<QueryMatchPart> = Vec::new();
            let cap = cap.unwrap(); //TODO: Make sure this unwrap is ok
            let mut group_i = 0;
            for group in regex.capture_names() {
                if let Some(name) = group {
                    if let Some(m) = cap.name(name) {
                        query_matches.push(QueryMatchPart::new_with_value(Some(name.to_string()), (m.start(), m.end()), m.as_str().to_string()));
                    } else {
                        query_matches.push(QueryMatchPart::new_error());
                    }
                } else {
                    if let Some(m) = cap.get(group_i) {
                        query_matches.push(QueryMatchPart::new_with_value(None, (m.start(), m.end()), m.as_str().to_string()));
                    } else {
                        query_matches.push(QueryMatchPart::new_error());
                    }
                    group_i += 1;
                }
            }
            query_results.push(Self::new(query_matches));
        }
        QueryResult::new_single_query(query_results)
    }
}

#[derive(Serialize, Deserialize)]
pub struct QueryMatchPart {
    pub name: Option<String>,
    pub range: (usize, usize),
    pub value: Option<String>,
    pub error: bool
}
impl QueryMatchPart {
    pub fn new(name: Option<String>, range: (usize, usize)) -> QueryMatchPart {
        QueryMatchPart { name, range, value: None, error: false }
    }
    pub fn new_with_value(name: Option<String>, range: (usize, usize), value: String) -> QueryMatchPart {
        QueryMatchPart { name, range, value: Some(value), error: false }
    }
    pub fn new_error() -> QueryMatchPart {
        QueryMatchPart { name: None, range: (0, 0), value: None, error: true }
    }
}

impl<'t> DocumentPart {
    pub fn tf(&self, freq: u64, b: f64, k: f64, stats: &Statistics) -> f64 {
        (freq as f64 * (k + 1.0)) / (freq as f64 + k * (1.0 - b + b * (self.text.len() as f64 / stats.lengthAvg)))
    }
    // pub fn score(&self, q: &FrozenToken, stats: &Statistics) -> Score {
    //     Score {
    //         tf: self.tf(self.matches(q), 0.75, 1.2, stats),
    //         idf: stats.idf_word(q)
    //     }
    // }
    pub fn score_sequence(&self, seq: &Vec<FrozenToken>, regex: Regex, stats: &Statistics) -> (Score, QueryResult) {
        let (freq, query_results) = self.matches_sequence(seq, regex);
        (Score {
            tf: self.tf(freq, 0.75, 1.2, stats),
            idf: stats.idf_words(seq)
        }, query_results)
    }
    pub fn score_regex(&'t self, q: Regex, stats: &Statistics) -> (Score, QueryResult) {
        let (freq, captures) = self.matches_regex(q);
        let mut set = HashSet::new();
        for cap in captures.matches.as_ref().unwrap() {
            let cap_full_str = cap.matches[0].value.as_ref().unwrap().as_str();
            let tokens = cap_full_str.tokenize();
            for token in tokens {
                if token.is_word() || token.is_stopword() {
                    set.insert(token.lemma().to_owned());
                }
            }
        }
        let tf = self.tf(freq, 0.75, 1.2, stats);
        (Score {
            tf,
            idf: stats.idf_strs(set.iter())
        }, captures)
    }
    pub fn matches(&self, q: &FrozenToken) -> u64 {
        if self.occurences.contains_key(q.lemma()) {
            self.occurences.get(q.lemma()).unwrap().len() as u64
        } else {
            0
        }
    }
    pub fn matches_regex(&'t self, q: Regex) -> (u64, QueryResult) {
        let query_results = QueryMatch::from_captures(&q, q.captures_iter(&self.text));
        (query_results.matches.as_ref().unwrap().len() as u64, query_results)
    }

    // While matching a sequence, the engine by default considers only the n number of tokens
    //  in the original query. For example, "yellowstone national park" will not be matched by a query for
    //  "yellowstone park". This makes sense in most cases, but adding a bit of cushion allows
    //  for additional flexibility. Setting it too high however is not ideal since the sentence
    //  search is not supposed to handle those cases, its the job of normal quote-less searches.
    const DISPERSION_CUSHION: f64 = 1.5;

    /**
     * Gets n or more tokens from a char_iter
     */
    // fn get_n_tokens(&'t self, n: usize, char_iter: &'t mut Chars) -> Vec<Token<'t>> {
    //     if n == 0 { return Vec::new(); }
    //     let mut collected: Vec<Token> = Vec::new();
    //     let remaining_text = char_iter.as_str();
    //     let tokens = remaining_text.tokenize();
    //     for token in tokens {
    //         if token.is_word() || token.is_stopword() {
    //             collected.push(token);
    //             if collected.len() >= n {
    //                 break;
    //             }
    //         }
    //     }
    //     collected
    // }
    
    // fn match_single_seq(&self, first: &str, candidate: u64, rem: &[Token]) -> bool {
    //     let mut char_iter = self.text.chars().into_iter();
    //     let candidate: usize = candidate.try_into().unwrap();
    //     if candidate > 0 {
    //         char_iter.nth(candidate-1).unwrap();
    //     }
    //     char_iter.nth(first.len()).unwrap();
        
    //     let tokens = self.get_n_tokens(rem.len(), &mut char_iter);
    //     let mut tokens_iter = tokens.iter();

    //     'outer: for r in rem {
    //         while let Some(token) = tokens_iter.next() {
    //             if token.is_word() || token.is_stopword() {
    //                 if token.lemma() == r.lemma() {
    //                     continue 'outer;
    //                 }
    //             }
    //         }
    //         return false;
    //     }

    //     return true;
    // }
    // fn match_restof_seq(&self, first: &str, candidates: &Vec<u64>, rem: &[Token]) -> u64 {
    //     let mut count: u64 = 0;
    //     for c in candidates {
    //         if self.match_single_seq(first, *c, rem) {
    //             count += 1;
    //         }
    //     }
    //     count
    // }
    // pub fn matches_sequence(&self, seq: &Vec<Token>) -> u64 {
    //     if seq.is_empty() {
    //         return 0;
    //     }
    //     if self.occurences.contains_key(seq[0].lemma()) {
    //         let first = self.occurences.get(seq[0].lemma()).unwrap();
    //         if seq.len() == 1 {
    //             return first.len() as u64;
    //         }
    //         self.match_restof_seq(seq[0].lemma(), &first, &seq[1..])
    //     } else {
    //         return 0;
    //     }
    // }









    fn get_n_tokens(&'t self, n: usize, char_iter: &'t mut Chars) -> (Vec<Token<'t>>, usize) {
        if n == 0 { return (Vec::new(), 0); }
        let mut collected: Vec<Token> = Vec::new();
        let remaining_text = char_iter.as_str();
        let tokens = remaining_text.tokenize();
        let mut _byte_len = 0;
        for token in tokens {
            _byte_len += token.original_byte_len();
            if token.is_word() || token.is_stopword() {
                collected.push(token);
                if collected.len() >= n {
                    break;
                }
            }
        }
        (collected, _byte_len)
    }

    fn get_n_tokens_left(&self, n: usize, char_iter: &mut Rev<Chars>) -> (Vec<FrozenToken>, usize) {
        if n == 0 { return (Vec::new(), 0); }
        let mut collected: Vec<FrozenToken> = Vec::new();
        let is_valid_word = |token: &FrozenToken| token.is_word() || token.is_stopword();
        let mut track: Vec<char> = Vec::new();
        let mut last_token: Option<FrozenToken> = None;
        let mut expected_char_size: usize = 0;
        let mut _byte_len = 0;
        for ch in char_iter {
            track.push(ch);
            let strack: String = track.iter().rev().collect();
            let new_token = (&strack[..]).tokenize().next();
            expected_char_size += 1;
            if let Some(new_token) = new_token {
                let new_token = new_token.freeze();
                let mut token_is_new = false;
                if new_token.original_char_count() != expected_char_size {
                    // SWITCHED
                    if let Some(last_token) = last_token.as_ref() { _byte_len += last_token.original_byte_len(); }
                    expected_char_size = 1;
                    token_is_new = true;
                }
                if let Some(last_token) = last_token {
                    if is_valid_word(&last_token) {
                        if is_valid_word(&new_token) {
                            if token_is_new { // If the length didn't change or decreased, we must have switched to a new word
                                // COMMIT
                                track = vec![ch];
                                collected.push(last_token);
                                if collected.len() >= n {
                                    break;
                                }
                            }
                        } else {
                            // COMMIT
                            track = vec![ch];
                            collected.push(last_token);
                            if collected.len() >= n {
                                break;
                            }
                        }
                    }
                }
                last_token = Some(new_token);
            }
        }
        (collected, _byte_len)
    }
    
    fn match_single_seq(&self, first_size: usize, candidate: u64, rem_left: &[FrozenToken], rem_right: &[FrozenToken]) -> (bool, Option<QueryMatch>) {
        // Right
        let mut char_iter_right = self.text.chars().into_iter();
        let _doc_byte_len = char_iter_right.as_str().len();
        let candidate: usize = candidate.try_into().unwrap();
        if candidate > 0 {
            char_iter_right.nth(candidate-1).unwrap();
        }
        let mut _doc_byte_candidate_char_left = _doc_byte_len - char_iter_right.as_str().len();
        char_iter_right.nth(first_size-1).unwrap();
        let mut _doc_byte_candidate_char_right = _doc_byte_len - char_iter_right.as_str().len();

        // log(&(String::from(" |remaining text on right| ") + "||" + char_iter_right.as_str()));
        
        let (tokens, _byte_len) = self.get_n_tokens(rem_right.len(), &mut char_iter_right);
        let mut tokens_iter = tokens.iter();

        // let RIGHT =tokens.iter().map(|t| t.lemma().to_owned()).reduce(|accum, item| accum+", "+&item).unwrap_or(String::new());
        // log(&(String::from(" |found on the right: ") + &RIGHT));
        'outer: for r in rem_right {
            while let Some(token) = tokens_iter.next() {
                if token.is_word() || token.is_stopword() {
                    if token.lemma() == r.lemma() {
                        continue 'outer;
                    }
                }
            }
            return (false, None);
        }
        _doc_byte_candidate_char_right += _byte_len;

        // Left
        let char_iter_left = self.text.chars().into_iter();
        let mut char_iter_left = char_iter_left.rev();
        char_iter_left.nth(self.totalChars - (candidate + 1));

        let (tokens, _byte_len) = self.get_n_tokens_left(rem_left.len(), &mut char_iter_left);
        let mut tokens_iter = tokens.iter().rev();

        // let LEFT =tokens.iter().map(|t| t.lemma().to_owned()).reduce(|accum, item| accum+", "+&item).unwrap_or(String::new());
        // log(&(LEFT + " |lr| " + &RIGHT));
        'outer: for r in rem_left {
            while let Some(token) = tokens_iter.next() {
                if token.is_word() || token.is_stopword() {
                    if token.lemma() == r.lemma() {
                        continue 'outer;
                    }
                }
            }
            return (false, None);
        }
        _doc_byte_candidate_char_left -= _byte_len;

        return (true, Some(QueryMatch::new(vec![QueryMatchPart::new(None, (_doc_byte_candidate_char_left, _doc_byte_candidate_char_right))])));
    }
    fn match_restof_seq(&self, first_size: usize, candidates: &Vec<u64>, rem_left: &[FrozenToken], rem_right: &[FrozenToken]) -> (u64, QueryResult) {
        let mut count: u64 = 0;
        let mut query_results: Vec<QueryMatch> = Vec::new();
        for c in candidates {
            let (matched, query_result) = self.match_single_seq(first_size, *c, rem_left, rem_right);
            if matched {
                count += 1;
                if let Some(query_result) = query_result {
                    query_results.push(query_result);
                }
            }
        }
        (count, QueryResult::new_single_query(query_results))
    }
    // pub fn matches_sequence(&self, seq: &Vec<Token>, regex: Regex) -> u64 {
    //     if seq.is_empty() {
    //         return 0;
    //     }
    //     return self.matches_regex(regex).0;
    // }
    pub fn matches_sequence(&self, seq: &Vec<FrozenToken>, _: Regex) -> (u64, QueryResult) {
        if seq.is_empty() {
            return (0, QueryResult::new_single_query(Vec::new()));
        }
        // Filter for all tokens with matches in the document
        let selectedStartingPoint: Vec<(usize, u64, &FrozenToken)> = seq.iter().enumerate().map(|(i, frag)| (i, self.matches(frag), frag)).filter(|(_, matches, _)| *matches != 0).collect();
        // let selectedStartingPoint: Vec<(usize, Option<&Vec<u64>>, &FrozenToken)> = seq.iter().enumerate().map(|(i, frag)| (i, self.matches(frag), frag)).filter(|(_, matches, _)| matches.is_some()).collect();
        // // If none of the words in the sequence appears in the document, there's no need to continue
        // if selectedStartingPoint.is_empty() {
        //     return 0;
        // }

        // All of the words in the query should appear in the document, otherwise there's no point in trying to search
        if selectedStartingPoint.len() != seq.len() {
            return (0, QueryResult::new_single_query(Vec::new()));
        }

        // Select the best starting point (the word with the least number of matches)
        let selectedStartingPoint = selectedStartingPoint.iter().min_by_key(|(_, matches, _)| matches).unwrap();
        let start = self.occurences.get(selectedStartingPoint.2.lemma()).unwrap();
        if seq.len() == 1 {
            return (start.len() as u64, QueryResult::new_single_query(Vec::new()));
        }

        let left = &seq[0..selectedStartingPoint.0];
        let right = &seq[selectedStartingPoint.0+1..];

        self.match_restof_seq(selectedStartingPoint.2.original_char_count(), &start, left, right)
    }














}

fn match_char_case(original: char, target: char) -> String {
    if original.is_lowercase() && target.is_uppercase() {
        target.to_lowercase().to_string()
    } else if original.is_uppercase() && target.is_lowercase() {
        target.to_uppercase().to_string()
    } else {
        target.to_string()
    }
}
fn match_case(original: &str, target: &str) -> String {
    let mut orig_iter = original.chars();
    let mut result = String::new();
    for c in target.chars() {
        if let Some(orig_c) = orig_iter.next() {
            result += &match_char_case(orig_c, c);
        } else {
            result.push(c);
        }
    }
    result
}

#[derive(Serialize, Deserialize)]
pub enum QueryType {
    WORD,
    SENTENCE,
    REGEX,
    NOOP,
    ALL
}
#[derive(Serialize, Deserialize)]
pub struct Query {
    pub t: QueryType,
    #[serde(skip)]
    pub token: Option<FrozenToken>,
    #[serde(skip)]
    pub tokens: Option<Vec<FrozenToken>>,
    #[serde(skip)]
    pub regex: Option<Regex>,
    pub children: Option<Vec<Query>>,
    pub originalString: String,
    pub adjustedString: Option<String>
}
impl Query {
    pub fn word(token: FrozenToken, originalString: String) -> Query {
        Query { t: QueryType::WORD, token: Some(token), tokens: None, regex: None, children: None, originalString, adjustedString: None }
    }
    pub fn sentence(tokens: Vec<FrozenToken>, regex: Regex, originalString: String, adjustedString: String) -> Query {
        Query { t: QueryType::SENTENCE, token: None, tokens: Some(tokens), regex: Some(regex), children: None, originalString, adjustedString: Some(adjustedString) }
    }
    pub fn regex(regex: Regex, originalString: String) -> Query {
        Query { t: QueryType::REGEX, token: None, tokens: None, regex: Some(regex), children: None, originalString, adjustedString: None }
    }
    pub fn noop(originalString: String) -> Query {
        Query { t: QueryType::NOOP, token: None, tokens: None, regex: None, children: None, originalString, adjustedString: None }
    }
    pub fn all(children: Vec<Query>) -> Query {
        Query { t: QueryType::ALL, token: None, tokens: None, regex: None, children: Some(children), originalString: String::new(), adjustedString: None }
    }
    pub fn score(&self, doc_part: &DocumentPart, stats: &Statistics) -> (Score, QueryResult) {
        match self.t {
            QueryType::ALL => {
                let mut sum = Score::zero();
                let mut query_results: Vec<QueryResult> = Vec::with_capacity(self.children.as_ref().unwrap().len());
                for child in self.children.as_ref().unwrap() {
                    let (score, qr) = child.score(doc_part, stats);
                    sum.add(&score);
                    query_results.push(qr);
                }
                (sum, QueryResult::new_group(query_results))
            },
            //Note: Use sentence instead
            // QueryType::WORD => {
            //     doc_part.score(self.token.as_ref().unwrap(), stats)
            // },
            QueryType::SENTENCE => {
                doc_part.score_sequence(self.tokens.as_ref().unwrap(), self.regex.as_ref().unwrap().clone(), stats)
            },
            QueryType::REGEX => {
                doc_part.score_regex(self.regex.as_ref().unwrap().clone(), stats)
            },
            _ => {
                (Score::zero(), QueryResult::new_single_query(Vec::new()))
            },
        }
    }
    pub fn parse(text: &str, stats: &Statistics) -> Query {
        let mut q = Query::all(Vec::new());
        let mut textg = text.graphemes(true);
        while textg.as_str() != "" {
            let (skip_graphemes, query_component) = Self::match_query(textg.as_str(), stats).unwrap();
            q.children.as_mut().unwrap().push(query_component);
            for _ in 0..skip_graphemes {
                textg.next().unwrap(); // This should never error
            }
        }
        return q;
    }
    // This should never return None
    fn match_query(t: &str, stats: &Statistics) -> Option<(usize, Query)> {
        lazy_static! {
            static ref MATCH_REGEX: Regex = Regex::new(r"^re:(?<!\\)\/(.*?)(?<!\\)\/([imsuUx]*)").unwrap();
            static ref MATCH_SENTENCE: Regex = Regex::new(r#"^(?<!\\)"([^"\\]*(?:\\.[^"\\]*)*)""#).unwrap();
            static ref MATCH_WORD: Regex = Regex::new(r"^([^ ]+)").unwrap();
            static ref MATCH_SPACES: Regex = Regex::new(r"^( +)").unwrap();
        }
        let m = Self::match_regex(&MATCH_REGEX, t);
        if let Some((skip_, content, flags)) = m {
            let regex;
            if let Some(flags) = flags {
                regex = Regex::new(&(String::from("(?") + flags.as_str() + ")" + content));
            } else {
                regex = Regex::new(&content);
            }
            if let Ok(regex) = regex {
                return Some((skip_, Query::regex(regex, content.to_owned())));
            }
        }
        let mut m = Self::match_regex(&MATCH_SENTENCE, t);
        if let None = m { m = Self::match_regex(&MATCH_WORD, t); }
        if let Some((skip_, content, _)) = m {
            let content_slice = &content[..];
            let mut tokens: Vec<FrozenToken> = content_slice.tokenize().filter(|token| token.is_word() || token.is_stopword()).map(|token| token.freeze()).collect();
            
            //TODO: Display these adjustments to the user
            let predict_until;
            if !tokens.is_empty() {
                predict_until = tokens.len()-1;
                for token in &mut tokens[..predict_until] {
                    token.predict(stats, 0.95);
                }
            }
            //TODO: Do not display these adjustments to the user
            if let Some(token) = tokens.last_mut() {
                token.predict(stats, 0.8);
            }
            // Generate adjusted string
            let mut byte_start = 0;
            let mut adjusted_string = String::new();
            for token in &tokens {
                if byte_start != token.byte_start {
                    adjusted_string += &content[byte_start..token.byte_start];
                    byte_start = token.byte_start;
                }
                let byte_end = byte_start+token.original_byte_len();
                adjusted_string += &match_case(&content[byte_start..byte_end], token.lemma());
                byte_start = byte_end;
            }
            if byte_start != content.len() {
                adjusted_string += &content[byte_start..content.len()];
                byte_start = content.len();
            }

            // Generate Regex
            let mut regex_src = String::from("(?is)");
            for token in &tokens {
                regex_src += &fancy_regex::escape(token.lemma());
                regex_src += ".{,10}?";
            }
            let regex = Regex::new(&regex_src).unwrap();

            return Some((skip_, Query::sentence(tokens, regex, content.to_owned(), adjusted_string)));
        }
        let m = Self::match_regex(&MATCH_SPACES, t);
        if let Some((skip_, content, _)) = m {
            return Some((skip_, Query::noop(content.to_owned())));
        }
        return None; // Something error-d on the way here
    }
    fn match_regex<'a>(regex: &Regex, t: &'a str) -> Option<(usize, &'a str, Option<Match<'a>>)> {
        if let Some(cap) = regex.captures_iter(t).next() {
            if let Ok(cap) = cap {
                let cap_len = cap.get(0).unwrap().as_str().graphemes(true).count(); // Count length of entire capture, not just the first capture group
                let cap2 = cap.get(2);
                let cap = cap.get(1);
                if let Some(cap) = cap {
                    return Some((cap_len, cap.as_str(), cap2));
                } else {
                    return None;
                }
            } else {
                return None;
            }
        } else {
            return None;
        }
    }
}
// ^re:(?<!\\)\/(.*?)(?<!\\)\/
// ^((?<!\\)"([^"\\]*(?:\\.[^"\\]*)*)")
// ^( +)
// ^([^ ]+)

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn init() {  }

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, cartographer!");
}

fn occurences(t: PartType, val: String) -> DocumentPart {
    let val_slice: &str = &val[..];
    let tokens = val_slice.tokenize();

    let mut totalWords = 0;
    let mut occurences: HashMap<String, Vec<u64>> = HashMap::new();

    let mut lastToken: Option<Token> = None;
    for token in tokens {
        if token.is_word() || token.is_stopword() {
            totalWords += 1;
            let entry = occurences.entry(token.lemma().to_owned()).or_insert(Vec::new());
            (*entry).push(token.char_start as u64);
        }
        lastToken = Some(token);
    }
    let mut totalChars = 0;
    if let Some(token) = lastToken {
        totalChars = token.char_end;
    }

    // If it's an URL, also register each part of the hostname
    if let PartType::URL = t {
        if let Ok(url) = Url::parse(&val) {
            if url.has_host() {
                if let Some(host) = url.host_str() {
                    // Count hostname offset in chars
                    if let Some(host_byte_offset) = val.find(host) {
                        let host_char_offset = val[..host_byte_offset].chars().count();

                        let mut char_i = 0;
                        let mut last_section_char_i = 0;
                        let mut last_section_byte_i = 0;
                        let byte_full_len = host.len();
                        let mut char_iter = host.chars();
                        while let Some(ch) = char_iter.next() {
                            let mut byte_i = byte_full_len - char_iter.as_str().len() - 1;

                            let ch_is_dot = ch == '.';
                            let char_iter_is_empty = char_iter.as_str() == "";
                            if ch_is_dot || char_iter_is_empty {
                                if char_iter_is_empty && !ch_is_dot {
                                    byte_i += 1;
                                    // char_i += 1;
                                }
                                let section = &host[last_section_byte_i..byte_i];
                                
                                // Process the section
                                for part_token in section.tokenize() {
                                    let entry = occurences.entry(part_token.lemma().to_owned()).or_insert(Vec::new());
                                    (*entry).push(host_char_offset as u64 + last_section_char_i as u64 + part_token.char_start as u64);
                                }

                                last_section_char_i = char_i + 1;
                                last_section_byte_i = byte_i + 1;
                            }

                            char_i += 1;
                        }
                    }
                }
            }
        }
    }

    DocumentPart {
        t,
        totalWords,
        totalChars,
        text: val,
        occurences
    }
}

// #[derive(Serialize, Deserialize)]
// pub struct QueryResult<'a> {
//     pub query: Query<'a>,
//     pub scores: HashMap<String, Score>
// }
// #[wasm_bindgen]
// pub fn query(q: String, docs_str: String, stats: String) -> JsValue {
//     utils::set_panic_hook();
//     let query = Query::parse(&q);
//     let docs: HashMap<String, Document> = serde_json::from_str(&docs_str).unwrap();
//     let stats: Statistics = serde_json::from_str(&stats).unwrap();
//     let mut scores: HashMap<String, Score> = HashMap::new();
//     for (_, doc) in &docs {
//         let score = doc.score(&query, &stats);
//         scores.insert(doc.id.clone(), score);
//     }
//     let result = QueryResult { query, scores };
//     JsValue::from_serde(&result).unwrap()
// }

// #[derive(Serialize, Deserialize)]
// pub struct QueryResult {
//     pub id: String,
//     pub score: Score
// }
// #[wasm_bindgen]
// pub fn query_one(doc_str: String, stats: String) -> JsValue {
//     utils::set_panic_hook();
//     let doc: Document = serde_json::from_str(&doc_str).unwrap();
//     let stats: Statistics = serde_json::from_str(&stats).unwrap();
//     let score;
//     unsafe {
//         if let Some(query) = &QUERY {
//             score = doc.score(query, &stats);
//         } else {
//             return JsValue::undefined();
//         }
//     }
//     let result = QueryResult { id: doc.id.clone(), score };
//     JsValue::from_serde(&result).unwrap()
// }

struct ShardStore {
    pub docs: HashMap<String, Document>,
    pub stats: Option<Statistics>,
    pub approx_bytes_used: usize,
}

thread_local! {
    static t_query: RefCell<Option<Query>> = RefCell::new(None);
    static t_shard: RefCell<Option<ShardStore>> = RefCell::new(None);
}

const MAX_BYTES_ALLOWED_IN_SHARD: usize = 1_000_000_000; // 1_000_000_000 = 1gb
//                                        4_294_967_295 is u32 max

#[wasm_bindgen]
pub fn parse_query(q: String) -> JsValue {
    utils::set_panic_hook();

    t_query.with(|query| {
        let mut query = query.borrow_mut();
        t_shard.with(|shard| {
            let shard = shard.borrow();

            if let Some(shard_store) = shard.as_ref() {
                *query = Some(Query::parse(&q, shard_store.stats.as_ref().unwrap()));

                JsValue::from_serde(query.as_ref().unwrap()).unwrap()
            } else {
                JsValue::UNDEFINED
            }
        })
    })
}

#[wasm_bindgen]
pub fn shard_uninitialized() -> JsValue {
    utils::set_panic_hook();

    t_shard.with(|shard| {
        let shard = shard.borrow();
        if let None = shard.as_ref() {
            return JsValue::TRUE;
        } else {
            return JsValue::FALSE;
        }
    })
}
#[wasm_bindgen]
pub fn init_shard() {
    utils::set_panic_hook();

    t_shard.with(|shard| {
        let mut shard = shard.borrow_mut();
        *shard = Some(ShardStore { docs: HashMap::new(), stats: None, approx_bytes_used: 0 });
    })
}

#[wasm_bindgen]
pub fn shard_doc(doc_str: String) -> JsValue {
    utils::set_panic_hook();

    t_shard.with(|shard| {
        let mut shard = shard.borrow_mut();

        if let Some(shard_store) = shard.as_mut() {
            // Check and update bytes used
            if shard_store.approx_bytes_used >= MAX_BYTES_ALLOWED_IN_SHARD {
                return JsValue::FALSE;
            }
            shard_store.approx_bytes_used += doc_str.len();
    
            // Parse and add document to shard
            let mut doc: Document = serde_json::from_str(&doc_str).unwrap();
            doc.approx_bytes_used = Some(doc_str.len());
            shard_store.docs.insert(doc.id.clone(), doc);
    
            return JsValue::TRUE;
        } else {
            return JsValue::UNDEFINED;
        }
    })
}

#[wasm_bindgen]
pub fn unshard_doc(id: String) -> JsValue {
    utils::set_panic_hook();

    t_shard.with(|shard| {
        let mut shard = shard.borrow_mut();

        if let Some(shard_store) = shard.as_mut() {
            // Remove doc from shard
            if let Some(doc) = shard_store.docs.remove(&id) {
                // Update bytes used
                shard_store.approx_bytes_used -= doc.approx_bytes_used.unwrap();
            }
            return JsValue::TRUE;
        } else {
            return JsValue::UNDEFINED;
        }
    })
}

#[wasm_bindgen]
pub fn update_stats(stats: String) -> JsValue {
    utils::set_panic_hook();

    t_shard.with(|shard| {
        let mut shard = shard.borrow_mut();

        if let Some(shard_store) = shard.as_mut() {
            let stats: Statistics = serde_json::from_str(&stats).unwrap();
            shard_store.stats = Some(stats);
            return JsValue::TRUE;
        } else {
            return JsValue::UNDEFINED;
        }
    })
}

// ================ FOR REFERENCE ================
// #[wasm_bindgen]
// pub fn query() -> JsValue {
//     utils::set_panic_hook();
//     let query = t_query.lock().unwrap();
//     let shard = t_shard.lock().unwrap();

//     if let (Some(query), Some(shard_store)) = (query.as_ref(), shard.as_ref()) {
//         if let Some(stats) = &shard_store.stats {
//             let mut scores: HashMap<String, Score> = HashMap::with_capacity(shard_store.docs.capacity());
//             for doc in shard_store.docs.values() {
//                 let score = doc.score(query, stats);
//                 scores.insert(doc.id.clone(), score);
//             }
//             return JsValue::from_serde(&scores).unwrap();
//         } else {
//             return JsValue::UNDEFINED;
//         }
//     } else {
//         return JsValue::UNDEFINED;
//     }
// }
// #[wasm_bindgen]
// pub fn query() -> JsValue {
//     utils::set_panic_hook();

//     t_query.with(|query| {
//         let query = query.borrow();
//         t_shard.with(|shard| {
//             let shard = shard.borrow();
            
//             if let (Some(query), Some(shard_store)) = (query.as_ref(), shard.as_ref()) {
//                 if let Some(stats) = &shard_store.stats {
//                     let mut scores: HashMap<String, Score> = HashMap::with_capacity(shard_store.docs.capacity());
//                     for doc in shard_store.docs.values() {
//                         let score = doc.score(query, stats);
//                         scores.insert(doc.id.clone(), score);
//                     }
//                     return JsValue::from_serde(&scores).unwrap();
//                 } else {
//                     return JsValue::UNDEFINED;
//                 }
//             } else {
//                 return JsValue::UNDEFINED;
//             }
//         })
//     })
// }
// ================ FOR REFERENCE ================

struct ReallyFastCommaSeparatedASCIIStringIterator2000 {
    val: String,
    curr: usize
}
impl ReallyFastCommaSeparatedASCIIStringIterator2000 {
    fn new(val: String) -> ReallyFastCommaSeparatedASCIIStringIterator2000 {
        ReallyFastCommaSeparatedASCIIStringIterator2000 { val, curr: 0 }
    }
    fn next(&mut self) -> Option<&str> {
        if self.curr > self.val.len() {
            return None;
        }
        let range_start = self.curr;
        let mut range_end = self.curr;
        let mut eof = true;
        let val_slice = &self.val[range_start..];
        for c in val_slice.chars() {
            eof = false;
            if c != ',' {
                range_end += 1;
            } else {
                break;
            }
        }
        if range_end == self.curr {
            if !eof {
                self.curr += 1;
                Some(&self.val[range_start..range_end])
            } else {
                None
            }
        } else {
            self.curr += range_end - range_start + 1;
            Some(&self.val[range_start..range_end])
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct ShardPartialQueryResult {
    score: f64,
    result: Vec<(PartType, QueryResult)>
}
#[wasm_bindgen]
pub fn query(ids: String, values_count: usize) -> JsValue {
    utils::set_panic_hook();

    t_query.with(|query| {
        let query = query.borrow();
        t_shard.with(|shard| {
            let shard = shard.borrow();
            
            if let (Some(query), Some(shard_store)) = (query.as_ref(), shard.as_ref()) {
                if let Some(stats) = &shard_store.stats {
                    let mut scores: HashMap<String, ShardPartialQueryResult> = HashMap::with_capacity(values_count);
                    let mut id_iter = ReallyFastCommaSeparatedASCIIStringIterator2000::new(ids);
                    while let Some(doc_id) = id_iter.next() {
                        if let Some(doc) = shard_store.docs.get(doc_id) {
                            let (score, query_results) = doc.score(query, stats);
                            scores.insert(doc.id.clone(), ShardPartialQueryResult { score: score.calculate(), result: query_results });
                        }
                    }
                    return JsValue::from_serde(&scores).unwrap();
                } else {
                    return JsValue::UNDEFINED;
                }
            } else {
                return JsValue::UNDEFINED;
            }
        })
    })
}

#[wasm_bindgen]
pub fn index(id: String, val: String, title: String, url: String, stats: String) -> JsValue {
    utils::set_panic_hook();
    let mut stats: Statistics = serde_json::from_str(&stats).unwrap();
    let mut doc = Document {
        id, parts: Vec::new(), approx_bytes_used: None
    };
    doc.parts.push(occurences(PartType::TITLE, title));
    doc.parts.push(occurences(PartType::URL, url));
    doc.parts.push(occurences(PartType::CONTENT, val));
    stats.add(&doc);
    let update = Update {
        stats: Some(stats), doc: Some(doc)
    };
    JsValue::from_serde(&update).unwrap()
}

#[wasm_bindgen]
pub fn unindex(doc: String, stats: String) -> JsValue {
    utils::set_panic_hook();
    let mut stats: Statistics = serde_json::from_str(&stats).unwrap();
    let doc: Document = serde_json::from_str(&doc).unwrap();
    stats.sub(&doc);
    let update = Update {
        stats: Some(stats), doc: None
    };
    JsValue::from_serde(&update).unwrap()
}

// static mut QUERY_STRING: Option<String> = None;
// static mut QUERY: Option<Query> = None;
// static mut SHARD: Option<Vec<Document>> = None;
// static mut BYTES_USED: usize = 0;

// const MAX_BYTES_ALLOWED_IN_SHARD: usize = 1_000_000_000; // 1_000_000_000 = 1gb
// //                                        4_294_967_295 is u32 max

// #[wasm_bindgen]
// pub fn parse_query(q: String) -> JsValue {
//     utils::set_panic_hook();
//     let js_value;
//     unsafe {
//         QUERY_STRING = Some(q);
//         let query = Query::parse(QUERY_STRING.as_ref().unwrap());
//         js_value = JsValue::from_serde(&query).unwrap();
//         QUERY = Some(query);
//         if let None = &SHARD {
//             SHARD = Some(Vec::new());
//         }
//     }
//     js_value
// }
// #[wasm_bindgen]
// pub fn shard_doc(doc_str: String) -> JsValue {
//     utils::set_panic_hook();
//     unsafe {
//         if BYTES_USED >= MAX_BYTES_ALLOWED_IN_SHARD {
//             return JsValue::FALSE;
//         }
//         BYTES_USED += doc_str.len(); //approximately
//         log(BYTES_USED.to_string().as_str());
//     }
//     let doc: Document = serde_json::from_str(&doc_str).unwrap();
//     unsafe {
//         if let Some(shard) = &mut SHARD {
//             shard.push(doc);
//             return JsValue::TRUE;
//         } else {
//             return JsValue::undefined();
//         }
//     }
// }
// #[wasm_bindgen]
// pub fn query(stats: String) -> JsValue {
//     utils::set_panic_hook();
//     let stats: Statistics = serde_json::from_str(&stats).unwrap();
//     unsafe {
//         if let Some(shard) = &SHARD {
//             let mut scores: HashMap<String, Score> = HashMap::new();
//             for doc in shard {
//                 let score = doc.score(QUERY.as_ref().unwrap(), &stats);
//                 scores.insert(doc.id.clone(), score);
//             }
//             JsValue::from_serde(&scores).unwrap()
//         } else {
//             JsValue::undefined()
//         }
//     }
// }

// #[wasm_bindgen]
// pub fn index(id: String, val: String, title: String, url: String, stats: String) -> JsValue {
//     utils::set_panic_hook();
//     let mut stats: Statistics = serde_json::from_str(&stats).unwrap();
//     let mut doc = Document {
//         id, parts: Vec::new()
//     };
//     doc.parts.push(occurences(PartType::TITLE, title));
//     doc.parts.push(occurences(PartType::URL, url));
//     doc.parts.push(occurences(PartType::CONTENT, val));
//     stats.add(&doc);
//     let update = Update {
//         stats: Some(stats), doc: Some(doc)
//     };
//     JsValue::from_serde(&update).unwrap()
// }

// #[wasm_bindgen]
// pub fn unindex(doc: String, stats: String) -> JsValue {
//     utils::set_panic_hook();
//     let mut stats: Statistics = serde_json::from_str(&stats).unwrap();
//     let doc: Document = serde_json::from_str(&doc).unwrap();
//     stats.sub(&doc);
//     let update = Update {
//         stats: Some(stats), doc: None
//     };
//     JsValue::from_serde(&update).unwrap()
// }
