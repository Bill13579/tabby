use std::collections::VecDeque;

use charabia::{TokenKind, Script, Language, SeparatorKind, Token};

use crate::{Statistics, log};

pub trait ToFrozenToken {
    fn freeze(&self) -> FrozenToken;
}
impl<'a> ToFrozenToken for Token<'a> {
    fn freeze(&self) -> FrozenToken {
        FrozenToken { kind: self.kind, lemma: self.lemma.to_string(), 
                    char_start: self.char_start, char_end: self.char_end, byte_start: self.byte_start, byte_end: self.byte_end, char_map: self.char_map.clone(), script: self.script, language: self.language }
    }
    // fn freeze_and_broaden(&self, stats: &Statistics) -> FrozenToken {
    //     let mut lemma_alternatives: Vec<String> = Vec::new();
    //     if !stats.occurences.contains_key(self.lemma()) {
    //         for word in stats.occurences.keys() {
    //             if word.chars().next().unwrap() == self.lemma().chars().next().unwrap() &&
    //                 jaro_winkler_similarity(self.lemma(), &word, Some(0.1)) >= 0.95 {
    //                 lemma_alternatives.push(word.clone());
    //             }
    //         }
    //     }
    //     FrozenToken { kind: self.kind, lemma: self.lemma.to_string(), lemma_alternatives, 
    //                 char_start: self.char_start, char_end: self.char_end, byte_start: self.byte_start, byte_end: self.byte_end, char_map: self.char_map.clone(), script: self.script, language: self.language }
    // }
}

// pub trait BroadCmp {
//     fn broad_cmp(&self, other: &Token) -> bool;
//     fn broad_cmp2(&self, other: &FrozenToken) -> bool;
// }
// impl BroadCmp for FrozenToken {
//     fn broad_cmp(&self, other: &Token) -> bool {
//         if self.lemma() == other.lemma() {
//             return true;
//         }
//         for alt in &self.lemma_alternatives {
//             if alt == other.lemma() {
//                 return true;
//             }
//         }
//         false
//     }
//     fn broad_cmp2(&self, other: &FrozenToken) -> bool {
//         if self.lemma() == other.lemma() {
//             return true;
//         }
//         for alt in &self.lemma_alternatives {
//             if alt == other.lemma() {
//                 return true;
//             }
//         }
//         false
//     }
// }

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct FrozenToken {
    /// kind of the Token assigned by the classifier
    pub kind: TokenKind,
    pub lemma: String,
    /// words that match the lemma from a fuzzy search of all the words in stats
    // pub lemma_alternatives: Vec<String>,
    /// index of the first and the last character of the original lemma
    pub char_start: usize,
    pub char_end: usize,
    /// index of the first and the last byte of the original lemma
    pub byte_start: usize,
    pub byte_end: usize,
    /// number of bytes used in the original string mapped to the number of bytes used in the normalized string by each char in the original string.
    /// The char_map must be the same length as the number of chars in the original lemma.
    pub char_map: Option<Vec<(u8, u8)>>,
    /// script of the Token
    pub script: Script,
    /// language of the Token
    pub language: Option<Language>,
}
impl FrozenToken {
    pub fn predict(&mut self, stats: &Statistics, min_similarity: f64) {
        let lemma;
        if !stats.occurences.contains_key(self.lemma()) {
            let mut best: Option<String> = None;
            let mut similarity: f64 = 0.0;
            for word in stats.occurences.keys() {
                if word.chars().next().unwrap() == self.lemma().chars().next().unwrap() {
                    let new_similarity = jaro_winkler_similarity(self.lemma(), &word, Some(0.1));
                    if new_similarity > similarity {
                        similarity = new_similarity;
                        best = Some(word.clone());
                    }
                }
            }
            if similarity >= min_similarity {
                lemma = best.unwrap();
            } else {
                lemma = self.lemma.to_string();
            }
        } else {
            lemma = self.lemma.to_string();
        }
        self.lemma = lemma;
    }

    /// Returns a reference over the normalized lemma.
    pub fn lemma(&self) -> &str {
        self.lemma.as_ref()
    }

    /// Returns the length in bytes of the normalized lemma.
    pub fn byte_len(&self) -> usize {
        self.lemma.len()
    }

    /// Returns the length in bytes of the original lemma.
    pub fn original_byte_len(&self) -> usize {
        self.byte_end - self.byte_start
    }

    /// Returns the count of characters of the normalized lemma.
    pub fn char_count(&self) -> usize {
        self.lemma.chars().count()
    }

    /// Returns the count of characters of the original lemma.
    pub fn original_char_count(&self) -> usize {
        self.char_end - self.char_start
    }

    /// Returns the [`TokenKind`] of the current token.
    pub fn kind(&self) -> TokenKind {
        self.kind
    }

    /// Returns true if the current token is a word.
    ///
    /// A token is considered as a word if it's not a separator nor a stop word.
    pub fn is_word(&self) -> bool {
        self.kind == TokenKind::Word
    }

    /// Returns true if the current token is a stop word.
    pub fn is_stopword(&self) -> bool {
        self.kind == TokenKind::StopWord
    }

    /// Returns true if the current token is a separator.
    pub fn is_separator(&self) -> bool {
        self.separator_kind().map_or(false, |_| true)
    }

    /// Returns Some([`SeparatorKind`]) if the token is a separator and None if it's a word or a stop word.
    pub fn separator_kind(&self) -> Option<SeparatorKind> {
        if let TokenKind::Separator(s) = self.kind {
            Some(s)
        } else {
            None
        }
    }

    /// Returns the number of characters and bytes in original token using number of bytes in normalized
    /// token.
    ///
    /// chars are counted in the pre-processed string (just before normalizing).
    /// For example, consider the string "léopard" which gets normalized to "leopard".
    /// `original_lengths(3)` for this token will return `(3, 4)` - the number of `(characters, bytes)` in
    /// the original string for 3 bytes in the normalized string.
    ///
    /// If the `char_map` hasn't been initialized (it is None), usually done
    /// by the de-unicoder, it counts the number of `(characters, bytes)` in self.lemma
    /// for the given number of bytes. A char is considered even if the number
    /// of bytes only covers a portion of it.
    ///
    /// # Arguments
    ///
    /// * `num_bytes` - number of bytes in normalized token
    pub fn original_lengths(&self, num_bytes: usize) -> (usize, usize) {
        match &self.char_map {
            None => {
                // if we don't have a char_map, we look for the number of chars in the current
                //   (probably normalized) string
                self.lemma
                    .char_indices()
                    .take_while(|(byte_index, _)| *byte_index < num_bytes)
                    .enumerate()
                    .last()
                    .map_or((0, 0), |(char_index, (byte_index, c))| {
                        let char_count = char_index + 1;
                        let byte_len = byte_index + c.len_utf8();
                        (char_count, byte_len)
                    })
            }
            Some(char_map) => {
                let mut normalized_byte_len = 0;
                let mut original_byte_len = 0;
                let char_count = char_map
                    .iter()
                    .take_while(|(original_bytes_in_char, normalized_bytes_in_char)| {
                        if normalized_byte_len < num_bytes {
                            original_byte_len += *original_bytes_in_char as usize;
                            normalized_byte_len += *normalized_bytes_in_char as usize;
                            true
                        } else {
                            false
                        }
                    })
                    .count();
                (char_count, original_byte_len)
            }
        }
    }
}

fn jaro_winkler_similarity<'a>(mut s1: &'a str, mut s2: &'a str, p: Option<f64>) -> f64 {
    if s2.len() > s1.len() {
        let tmp = s1;
        s1 = s2;
        s2 = tmp;
    }

    let max_apart = (s1.len() / 2) - 1;
    let mut queue: VecDeque<(usize, char, u8)> = VecDeque::with_capacity(s1.len() / 2);
    let mut o1: Vec<Option<char>> = vec![None; s1.len()];
    let mut o2: Vec<Option<char>> = vec![None; s2.len()];

    let mut m = 0;
    let mut l = 0;
    let mut streak = true;

    let mut c2: Option<char>;
    let mut c2_iter = s2.chars();

    for (i, c1) in s1.chars().enumerate() {
        c2 = c2_iter.next();
        if c2.is_some() && c1 == c2.unwrap() {
            m += 1;
            if streak {
                l += 1;
            }
            o1[i] = Some(c1);
            o2[i] = Some(c2.unwrap());
        } else {
            streak = false;
            while let Some(val) = queue.front() {
                if i - val.0 > max_apart {
                    queue.pop_front();
                } else {
                    break;
                }
            }
            let mut c1_found = false;
            let mut c2_found = false;
            queue.retain(|(ip, cp, which)| {
                if *which == 2 {
                    if c1 == *cp && !c1_found {
                        m += 1;
                        c1_found = true;
                        o1[i] = Some(c1);
                        o2[*ip] = Some(*cp);
                        false
                    } else {
                        true
                    }
                } else if c2.is_some() {
                    if c2.unwrap() == *cp && !c2_found {
                        m += 1;
                        c2_found = true;
                        o1[*ip] = Some(*cp);
                        o2[i] = Some(c2.unwrap());
                        false
                    } else {
                        true
                    }
                } else { false } // We've run out of the second string, characters from string 1 can't be matched anymore
            });
            queue.push_back((i, c1, 1));
            if c2.is_some() {
                queue.push_back((i, c2.unwrap(), 2));
            }
        }
    }

    let cmp = o1.iter().filter(|c1| c1.is_some()).map(|c1| c1.unwrap())
                    .zip(o2.iter().filter(|c2| c2.is_some()).map(|c2| c2.unwrap()));
    let mut d = 0.0;
    for (c1, c2) in cmp {
        if c1 != c2 {
            d += 1.0;
        }
    }

    if m == 0 {
        0.0
    } else {
        let m = m as f64;
        let t = d / 2.0;
        let sim_j = (m / s1.len() as f64 + m / s2.len() as f64 + (m-t) / m) / 3.0;
        if let Some(p) = p {
            let l = l.min(4) as f64;
            sim_j + l * p * (1.0 - sim_j)
        } else {
            sim_j
        }
    }
}