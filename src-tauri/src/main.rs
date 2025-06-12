// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
struct Card {
    id: Option<i64>,
    question: String,
    option_a: Option<String>,
    option_b: Option<String>,
    option_c: Option<String>,
    option_d: Option<String>,
    option_e: Option<String>,
    correct_answer: Option<String>,
    blank_answer: Option<String>,
    question_type: String, // 'multiple_choice' or 'fill_in_blank'
    subject: String,
    difficulty: i32,
    image_path: Option<String>,
    created_at: Option<String>,
    updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Session {
    id: Option<i64>,
    started_at: String,
    ended_at: Option<String>,
    total_questions: i32,
    correct_answers: Option<i32>,
    session_type: String, // 'practice' or 'test'
}

#[derive(Debug, Serialize, Deserialize)]
struct Attempt {
    id: Option<i64>,
    session_id: i64,
    card_id: i64,
    user_answer: String,
    is_correct: bool,
    time_taken: Option<i32>,
    attempted_at: String,
}

// Database initialization
fn init_database(app_handle: &AppHandle) -> SqlResult<Connection> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get app data directory");
    
    std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    
    let db_path = app_dir.join("testdeck.db");
    let conn = Connection::open(db_path)?;
    
    // Create tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            option_d TEXT,
            option_e TEXT,
            correct_answer TEXT,
            blank_answer TEXT,
            question_type TEXT NOT NULL DEFAULT 'multiple_choice',
            subject TEXT NOT NULL,
            difficulty INTEGER NOT NULL DEFAULT 1,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            started_at DATETIME NOT NULL,
            ended_at DATETIME,
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER,
            session_type TEXT NOT NULL DEFAULT 'practice'
        )",
        [],
    )?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            card_id INTEGER NOT NULL,
            user_answer TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL,
            time_taken INTEGER,
            attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions (id),
            FOREIGN KEY (card_id) REFERENCES cards (id)
        )",
        [],
    )?;
    
    // Create indexes for better performance
    conn.execute("CREATE INDEX IF NOT EXISTS idx_cards_subject ON cards(subject)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_cards_difficulty ON cards(difficulty)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_attempts_card ON attempts(card_id)", [])?;
    
    println!("✅ Database initialized successfully");
    Ok(conn)
}

// Card operations
#[tauri::command]
async fn create_card(app_handle: AppHandle, card: Card) -> Result<i64, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    let result = conn.execute(
        "INSERT INTO cards (question, option_a, option_b, option_c, option_d, option_e, 
         correct_answer, blank_answer, question_type, subject, difficulty, image_path) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        [
            &card.question,
            &card.option_a.unwrap_or_default(),
            &card.option_b.unwrap_or_default(),
            &card.option_c.unwrap_or_default(),
            &card.option_d.unwrap_or_default(),
            &card.option_e.unwrap_or_default(),
            &card.correct_answer.unwrap_or_default(),
            &card.blank_answer.unwrap_or_default(),
            &card.question_type,
            &card.subject,
            &card.difficulty.to_string(),
            &card.image_path.unwrap_or_default(),
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
async fn get_all_cards(app_handle: AppHandle) -> Result<Vec<Card>, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, question, option_a, option_b, option_c, option_d, option_e, 
         correct_answer, blank_answer, question_type, subject, difficulty, image_path, 
         created_at, updated_at FROM cards ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let card_iter = stmt.query_map([], |row| {
        Ok(Card {
            id: Some(row.get(0)?),
            question: row.get(1)?,
            option_a: row.get(2).ok(),
            option_b: row.get(3).ok(),
            option_c: row.get(4).ok(),
            option_d: row.get(5).ok(),
            option_e: row.get(6).ok(),
            correct_answer: row.get(7).ok(),
            blank_answer: row.get(8).ok(),
            question_type: row.get(9)?,
            subject: row.get(10)?,
            difficulty: row.get(11)?,
            image_path: row.get(12).ok(),
            created_at: row.get(13).ok(),
            updated_at: row.get(14).ok(),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut cards = Vec::new();
    for card in card_iter {
        cards.push(card.map_err(|e| e.to_string())?);
    }
    
    Ok(cards)
}

#[tauri::command]
async fn get_cards_by_subject(app_handle: AppHandle, subject: String) -> Result<Vec<Card>, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, question, option_a, option_b, option_c, option_d, option_e, 
         correct_answer, blank_answer, question_type, subject, difficulty, image_path, 
         created_at, updated_at FROM cards WHERE subject = ?1 ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let card_iter = stmt.query_map([&subject], |row| {
        Ok(Card {
            id: Some(row.get(0)?),
            question: row.get(1)?,
            option_a: row.get(2).ok(),
            option_b: row.get(3).ok(),
            option_c: row.get(4).ok(),
            option_d: row.get(5).ok(),
            option_e: row.get(6).ok(),
            correct_answer: row.get(7).ok(),
            blank_answer: row.get(8).ok(),
            question_type: row.get(9)?,
            subject: row.get(10)?,
            difficulty: row.get(11)?,
            image_path: row.get(12).ok(),
            created_at: row.get(13).ok(),
            updated_at: row.get(14).ok(),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut cards = Vec::new();
    for card in card_iter {
        cards.push(card.map_err(|e| e.to_string())?);
    }
    
    Ok(cards)
}

#[tauri::command]
async fn update_card(app_handle: AppHandle, id: i64, card: Card) -> Result<(), String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE cards SET question = ?1, option_a = ?2, option_b = ?3, option_c = ?4, 
         option_d = ?5, option_e = ?6, correct_answer = ?7, blank_answer = ?8, 
         question_type = ?9, subject = ?10, difficulty = ?11, image_path = ?12, 
         updated_at = CURRENT_TIMESTAMP WHERE id = ?13",
        [
            &card.question,
            &card.option_a.unwrap_or_default(),
            &card.option_b.unwrap_or_default(),
            &card.option_c.unwrap_or_default(),
            &card.option_d.unwrap_or_default(),
            &card.option_e.unwrap_or_default(),
            &card.correct_answer.unwrap_or_default(),
            &card.blank_answer.unwrap_or_default(),
            &card.question_type,
            &card.subject,
            &card.difficulty.to_string(),
            &card.image_path.unwrap_or_default(),
            &id.to_string(),
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn delete_card(app_handle: AppHandle, id: i64) -> Result<(), String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    // Delete related attempts first
    conn.execute("DELETE FROM attempts WHERE card_id = ?1", [&id.to_string()])
        .map_err(|e| e.to_string())?;
    
    // Delete the card
    conn.execute("DELETE FROM cards WHERE id = ?1", [&id.to_string()])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Session operations
#[tauri::command]
async fn create_session(app_handle: AppHandle, session: Session) -> Result<i64, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO sessions (started_at, total_questions, session_type) VALUES (?1, ?2, ?3)",
        [&session.started_at, &session.total_questions.to_string(), &session.session_type],
    ).map_err(|e| e.to_string())?;
    
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
async fn end_session(app_handle: AppHandle, session_id: i64, correct_answers: i32) -> Result<(), String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE sessions SET ended_at = CURRENT_TIMESTAMP, correct_answers = ?1 WHERE id = ?2",
        [&correct_answers.to_string(), &session_id.to_string()],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

// Attempt operations
#[tauri::command]
async fn record_attempt(app_handle: AppHandle, attempt: Attempt) -> Result<i64, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO attempts (session_id, card_id, user_answer, is_correct, time_taken, attempted_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [
            &attempt.session_id.to_string(),
            &attempt.card_id.to_string(),
            &attempt.user_answer,
            &attempt.is_correct.to_string(),
            &attempt.time_taken.unwrap_or(0).to_string(),
            &attempt.attempted_at,
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(conn.last_insert_rowid())
}

// Statistics operations
#[tauri::command]
async fn get_subject_stats(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT c.subject, 
                COUNT(c.id) as total_cards,
                COUNT(a.id) as total_attempts,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_attempts,
                ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 100.0 ELSE 0.0 END), 2) as accuracy
         FROM cards c
         LEFT JOIN attempts a ON c.id = a.card_id
         GROUP BY c.subject
         ORDER BY c.subject"
    ).map_err(|e| e.to_string())?;
    
    let stats_iter = stmt.query_map([], |row| {
        Ok(serde_json::json!({
            "subject": row.get::<_, String>(0)?,
            "total_cards": row.get::<_, i32>(1)?,
            "total_attempts": row.get::<_, i32>(2)?,
            "correct_attempts": row.get::<_, i32>(3)?,
            "accuracy": row.get::<_, f64>(4)?
        }))
    }).map_err(|e| e.to_string())?;
    
    let mut stats = Vec::new();
    for stat in stats_iter {
        stats.push(stat.map_err(|e| e.to_string())?);
    }
    
    Ok(stats)
}

#[tauri::command]
async fn get_daily_stats(app_handle: AppHandle, days: i32) -> Result<Vec<serde_json::Value>, String> {
    let conn = init_database(&app_handle).map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT DATE(s.started_at) as date,
                COUNT(DISTINCT s.id) as sessions,
                COUNT(a.id) as total_questions,
                SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(CASE WHEN a.is_correct = 1 THEN 100.0 ELSE 0.0 END), 2) as accuracy
         FROM sessions s
         LEFT JOIN attempts a ON s.id = a.session_id
         WHERE DATE(s.started_at) >= DATE('now', '-' || ?1 || ' days')
         GROUP BY DATE(s.started_at)
         ORDER BY DATE(s.started_at) DESC"
    ).map_err(|e| e.to_string())?;
    
    let stats_iter = stmt.query_map([&days.to_string()], |row| {
        Ok(serde_json::json!({
            "date": row.get::<_, String>(0)?,
            "sessions": row.get::<_, i32>(1)?,
            "total_questions": row.get::<_, i32>(2)?,
            "correct_answers": row.get::<_, i32>(3)?,
            "accuracy": row.get::<_, f64>(4)?
        }))
    }).map_err(|e| e.to_string())?;
    
    let mut stats = Vec::new();
    for stat in stats_iter {
        stats.push(stat.map_err(|e| e.to_string())?);
    }
    
    Ok(stats)
}

fn main() {
    println!("🚀 TestDeck Local başlatılıyor...");
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_card,
            get_all_cards,
            get_cards_by_subject,
            update_card,
            delete_card,
            create_session,
            end_session,
            record_attempt,
            get_subject_stats,
            get_daily_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
