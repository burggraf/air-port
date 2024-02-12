use warp::{http::StatusCode, Filter};
use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[tokio::main]
async fn main() {
    let get_file = warp::get()
        .and(warp::path("getfile"))
        .and(warp::header::<String>("authorization"))
        .and_then(handle_get_file);

        let delete_file = warp::get()
        .and(warp::path!("deletefile" / String))
        .and(warp::header::<String>("authorization"))
        .and_then(handle_delete_file);    
        
    let routes = get_file.or(delete_file);

    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
}

async fn handle_get_file(auth: String) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    if !authorize(&auth) {
        return Ok(Box::new(warp::reply::with_status("Unauthorized", StatusCode::UNAUTHORIZED)));
    }

    match find_oldest_file("/home/ubuntu/stats") {
        Some(filename) => {
            let contents = fs::read_to_string(&filename).unwrap();
            let response = FileResponse { name: filename, contents };
            let json_reply = warp::reply::json(&response);
            Ok(Box::new(warp::reply::with_status(json_reply, StatusCode::OK)))
        },
        None => Ok(Box::new(warp::reply::with_status("No file found", StatusCode::NOT_FOUND))),
    }
}

async fn handle_delete_file(filename: String, auth: String) -> Result<Box<dyn warp::Reply>, warp::Rejection> {
    if !authorize(&auth) {
        return Ok(Box::new(warp::reply::with_status("Unauthorized", StatusCode::UNAUTHORIZED)));
    }


    let path = Path::new("/home/ubuntu/stats").join(&filename);
    // println!("Checking if file exists: {:?}", path);
    if path.exists() {
        // println!("File exists. Deleting file: {:?}", path);
        match fs::remove_file(&path) {
            Ok(_) => {
                // println!("File successfully deleted.");
                Ok(Box::new(warp::reply::with_status("File deleted", StatusCode::OK)))
            },
            Err(_e) => {
                // println!("Error deleting file: {:?}", e);
                Ok(Box::new(warp::reply::with_status("Error deleting file", StatusCode::INTERNAL_SERVER_ERROR)))
            }
        }
    } else {
        // println!("File not found: {:?}", path);
        Ok(Box::new(warp::reply::with_status("File not found", StatusCode::NOT_FOUND)))
    }
}

fn authorize(token: &str) -> bool {
    token == "YourSecretToken"
}

fn find_oldest_file(dir: &str) -> Option<String> {
    let mut oldest_file: Option<String> = None;
    let mut oldest_timestamp: Option<u64> = None;

    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(Result::ok) {
            let path = entry.path();
            if path.is_file() {
                if let Some(file_name) = path.file_stem().and_then(|s| s.to_str()) {
                    if let Ok(timestamp) = file_name.parse::<u64>() {
                        match oldest_timestamp {
                            Some(ts) => {
                                if timestamp < ts {
                                    oldest_timestamp = Some(timestamp);
                                    oldest_file = Some(path.to_string_lossy().into_owned());
                                }
                            }
                            None => {
                                oldest_timestamp = Some(timestamp);
                                oldest_file = Some(path.to_string_lossy().into_owned());
                            }
                        }
                    }
                }
            }
        }
    }

    oldest_file
}

#[derive(Serialize, Deserialize)]
struct FileResponse {
    name: String,
    contents: String,
}
