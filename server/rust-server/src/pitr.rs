use hyper::{Request, Response, Body, StatusCode};
use serde::{Deserialize};
use serde_json::json;
use std::process::Command;
use std::str;
use chrono::Utc; // Add this for handling UTC time

#[derive(Deserialize)]
struct PITRData {
    port: String,
    timestamp: String,
    db: String,
    mode: String,
}

pub async fn handle_pitr(mut req: Request<Body>) -> Result<Response<Body>, hyper::Error> {    // Parse request body
    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    
    // Make pitr_data mutable
    let mut pitr_data: PITRData = serde_json::from_str(&body_str).unwrap();

    let is_latest_timestamp = pitr_data.timestamp == "latest";
    // Process the timestamp to create a destination string
    let mut destination = pitr_data.timestamp.replace(":", "-");
    
    if is_latest_timestamp {
        destination = Utc::now().format("%Y-%m-%d-%H-%M-%S").to_string();
        pitr_data.timestamp = destination.clone(); // Now you can modify timestamp
    }
    
    match pitr_data.mode.as_str() {
        "backup-folder" => {
            if pitr_data.mode == "backup-folder" {
                // Determine the appropriate restore command based on the timestamp value
                let restore_command = if is_latest_timestamp {
                    // Omit the -timestamp parameter
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/backups/{}/{}.db /home/ubuntu/data/{}/pb_data/{}.db",
                        pitr_data.port, destination, pitr_data.db, pitr_data.port, pitr_data.db
                    )
                } else {
                    // Include the -timestamp parameter
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/backups/{}/{}.db -timestamp {} /home/ubuntu/data/{}/pb_data/{}.db",
                        pitr_data.port, destination, pitr_data.db, pitr_data.timestamp, pitr_data.port, pitr_data.db
                    )
                };

                // Execute the restore command
                let restore_output = Command::new("sh")
                    .arg("-c")
                    .arg(&restore_command)
                    .output()
                    .expect("Failed to execute restore command");

                // Handle restore command output
                if !restore_output.status.success() {
                    let error_message = str::from_utf8(&restore_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }

                // Construct and execute the zip command
                let zip_command = format!(
                    "zip -j -m /home/ubuntu/data/{}/pb_data/backups/{}/{}.zip /home/ubuntu/data/{}/pb_data/backups/{}/{}.db",
                    pitr_data.port, destination, pitr_data.db, pitr_data.port, destination, pitr_data.db
                );

                let zip_output = Command::new("sh")
                    .arg("-c")
                    .arg(&zip_command)
                    .output()
                    .expect("Failed to execute zip command");

                if !zip_output.status.success() {
                    let error_message = str::from_utf8(&zip_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }

                // Return successful response for "backup-folder" mode
                let response_data = format!("{}-{}.zip", destination, pitr_data.db);
                return Ok(Response::builder()
                    .status(StatusCode::OK)
                    .body(Body::from(json!({ "data": response_data, "error": null }).to_string()))
                    .unwrap());
            }
        },
        "backup-overwrite" => {
            if pitr_data.mode == "backup-overwrite" {
                // First command: zip
                let zip_command = format!(
                    "mkdir -p /home/ubuntu/data/{}/pb_data/backups/{}; zip -j -m /home/ubuntu/data/{}/pb_data/backups/{}/{} /home/ubuntu/data/{}/pb_data/{}*",
                    pitr_data.port, destination, pitr_data.port, destination, pitr_data.db, pitr_data.port, pitr_data.db
                );
                let zip_output = Command::new("sh")
                    .arg("-c")
                    .arg(&zip_command)
                    .output()
                    .expect("Failed to execute zip command");
                    
                if !zip_output.status.success() {
                    let error_message = str::from_utf8(&zip_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }
        
                // Second command: litestream restore
                let restore_command = if pitr_data.timestamp == "latest" {
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/{}.db /home/ubuntu/data/{}/pb_data/{}.db",
                        pitr_data.port, pitr_data.db, pitr_data.port, pitr_data.db
                    )
                } else {
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/{}.db -timestamp {} /home/ubuntu/data/{}/pb_data/{}.db",
                        pitr_data.port, pitr_data.db, pitr_data.timestamp, pitr_data.port, pitr_data.db
                    )
                };
                let restore_output = Command::new("sh")
                    .arg("-c")
                    .arg(&restore_command)
                    .output()
                    .expect("Failed to execute restore command");
                
                if !restore_output.status.success() {
                    let error_message = str::from_utf8(&restore_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }
        
                // Return successful response for "backup-overwrite" mode
                let response_data = format!("Backup and overwrite operation completed for database: {}", pitr_data.db);
                return Ok(Response::builder()
                    .status(StatusCode::OK)
                    .body(Body::from(json!({ "data": response_data, "error": null }).to_string()))
                    .unwrap());
            }
        },
        "erase-overwrite" => {
            if pitr_data.mode == "erase-overwrite" {
                // First command: remove database files
                let remove_command = format!(
                    "rm /home/ubuntu/data/{}/pb_data/{}*", 
                    pitr_data.port, pitr_data.db
                );
        
                let remove_output = Command::new("sh")
                    .arg("-c")
                    .arg(&remove_command)
                    .output()
                    .expect("Failed to execute remove command");
        
                if !remove_output.status.success() {
                    let error_message = str::from_utf8(&remove_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }
        
                // Second command: litestream restore
                let restore_command = if pitr_data.timestamp == "latest" {
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/{}.db /home/ubuntu/data/{}/pb_data/{}.db", 
                        pitr_data.port, pitr_data.db, pitr_data.port, pitr_data.db
                    )
                } else {
                    format!(
                        "litestream restore -o /home/ubuntu/data/{}/pb_data/{}.db -timestamp {} /home/ubuntu/data/{}/pb_data/{}.db", 
                        pitr_data.port, pitr_data.db, pitr_data.timestamp, pitr_data.port, pitr_data.db
                    )
                };
        
                let restore_output = Command::new("sh")
                    .arg("-c")
                    .arg(&restore_command)
                    .output()
                    .expect("Failed to execute restore command");
        
                if !restore_output.status.success() {
                    let error_message = str::from_utf8(&restore_output.stderr).unwrap_or("Unknown error occurred");
                    return Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                        .unwrap());
                }
        
                // Return successful response for "erase-overwrite" mode
                let response_data = format!("Erase and overwrite operation completed for database: {}", pitr_data.db);
                return Ok(Response::builder()
                    .status(StatusCode::OK)
                    .body(Body::from(json!({ "data": response_data, "error": null }).to_string()))
                    .unwrap());
            }
        },
        _ => {
            // Handle unexpected mode
                // Return error response for unrecognized mode
                let error_message = format!("Unrecognized or unsupported mode: '{}'", pitr_data.mode);
                return Ok(Response::builder()
                    .status(StatusCode::BAD_REQUEST)
                    .body(Body::from(json!({ "data": null, "error": error_message }).to_string()))
                    .unwrap());
        }
    }

    // Return successful response
    let response_data = format!("{}-{}.zip", destination, pitr_data.db);
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": response_data, "error": null }).to_string()))
        .unwrap())
}
