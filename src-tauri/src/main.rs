// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{Manager, State};

struct PythonBackend(Mutex<Option<Child>>);

#[tauri::command]
fn start_backend(state: State<PythonBackend>) -> Result<String, String> {
    let mut backend = state.0.lock().map_err(|e| e.to_string())?;

    if backend.is_some() {
        return Ok("Backend already running".to_string());
    }

    // Start Python backend
    let child = Command::new("python")
        .args(["-m", "uvicorn", "analyzer.main:app", "--host", "127.0.0.1", "--port", "8000"])
        .current_dir("../video-analyzer")
        .spawn()
        .map_err(|e| format!("Failed to start backend: {}", e))?;

    *backend = Some(child);
    Ok("Backend started".to_string())
}

#[tauri::command]
fn stop_backend(state: State<PythonBackend>) -> Result<String, String> {
    let mut backend = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(mut child) = backend.take() {
        child.kill().map_err(|e| format!("Failed to stop backend: {}", e))?;
        Ok("Backend stopped".to_string())
    } else {
        Ok("Backend was not running".to_string())
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to FRC Video Analyzer.", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(PythonBackend(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![greet, start_backend, stop_backend])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Stop backend on window close
                if let Some(state) = window.try_state::<PythonBackend>() {
                    if let Ok(mut backend) = state.0.lock() {
                        if let Some(mut child) = backend.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
