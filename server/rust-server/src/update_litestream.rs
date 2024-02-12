use hyper::{Request, Response, Body, StatusCode};
use serde::{Deserialize};
use serde_json::json;
use std::process::Command;
use tokio::fs::{File, OpenOptions};
use tokio::io::{AsyncWriteExt, AsyncReadExt};

#[derive(Deserialize)]
struct FileData {
    filename: String,
    contents: String,
    // destination: String, // Add destination field
}

pub async fn handle_update_litestream(mut req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let file_data: Vec<FileData> = serde_json::from_str(&body_str).unwrap();

    // Process each FileData and update files
    for data in file_data {
        let file_path = format!("/home/ubuntu/litestream.config/{}", data.filename);
        let mut file = File::create(&file_path).await.unwrap();
        file.write_all(data.contents.as_bytes()).await.unwrap();

        // If contents is empty and destination is not empty, run the rclone delete command
        // if data.contents.is_empty() && !data.destination.is_empty() {
        //     let command = format!("rclone delete {}:azabab/backups/{}", data.destination, data.filename);
        //     println!("delete command: {}", command); // For debugging
        //     let _ = Command::new("sh")
        //         .arg("-c")
        //         .arg(command)
        //         .output();
        // }
    }

    // Concatenate and update litestream configuration
    let mut paths = tokio::fs::read_dir("/home/ubuntu/litestream.config/").await.unwrap();
    let mut combined_contents = String::new();
    while let Some(path) = paths.next_entry().await.unwrap() {
        let mut file = File::open(path.path()).await.unwrap();
        let mut contents = String::new();
        file.read_to_string(&mut contents).await.unwrap();
        combined_contents.push_str(&contents);
    }

    let mut output_file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .open("/etc/litestream.yml")
        .await.unwrap();

    // Write the specific line first
    output_file.write_all(b"dbs:\n").await.unwrap();
    // Then append the combined contents
    output_file.write_all(combined_contents.as_bytes()).await.unwrap();

    // Restart litestream service
    let _ = Command::new("systemctl")
        .arg("restart")
        .arg("litestream.service")
        .output();

    // Return response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from(json!({ "data": "OK", "error": null }).to_string()))
        .unwrap())
}
