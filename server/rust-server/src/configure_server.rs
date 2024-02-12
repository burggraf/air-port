use hyper::{Request, Response, Body, StatusCode};
use serde::Deserialize;
//use std::process::Command;
use tokio::fs::{self, File};
use tokio::io::AsyncWriteExt;

#[derive(Deserialize)]
struct ConfigData {
    rclone_conf: String,
    // nats_server_conf: String,
}

pub async fn handle_configure_server(mut req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    println!("handle_configure_server");

    // Parse request body
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let config_data: ConfigData = serde_json::from_str(&body_str).unwrap();

    // Process rclone_conf
    println!("Process rclone_conf");
    let rclone_dir = "/root/.config/rclone";
    fs::create_dir_all(rclone_dir).await.unwrap();
    let rclone_file_path = format!("{}/rclone.conf", rclone_dir);
    let mut rclone_file = File::create(&rclone_file_path).await.unwrap();
    rclone_file.write_all(config_data.rclone_conf.as_bytes()).await.unwrap();
    
    println!("Configuration updated successfully");
    
    // Return response
    Ok(Response::builder()
        .status(StatusCode::OK)
        .body(Body::from("Configuration updated successfully"))
        .unwrap())
}
