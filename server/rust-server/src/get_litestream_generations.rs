use hyper::{Request, Response, Body, StatusCode};
use serde_json::json;
use std::process::Command;
use std::str;

use crate::AUTH_TOKEN;

pub async fn handle_get_litestream_generations(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    // Check for authorization header
    if let Some(auth_header) = req.headers().get(hyper::header::AUTHORIZATION) {
        if auth_header != AUTH_TOKEN {
            return Ok(Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::from(json!({ "data": null, "error": "Unauthorized" }).to_string()))
                .unwrap());
        }
    } else {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from(json!({ "data": null, "error": "No Authorization Header" }).to_string()))
            .unwrap());
    }

    // Parse request body for port and db parameters
    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let body_params: serde_json::Value = serde_json::from_str(&body_str).unwrap();

    let port = body_params["port"].as_str().unwrap_or_default();
    let db = body_params["db"].as_str().unwrap_or_default();

    // Execute litestream command
    let litestream_command = format!("litestream generations /home/ubuntu/data/{}/pb_data/{}.db", port, db);
    let output = Command::new("sh")
        .arg("-c")
        .arg(&litestream_command)
        .output()
        .expect("failed to execute process");

    // Check for command execution success
    if output.status.success() {
        let output_str = str::from_utf8(&output.stdout).unwrap_or_default();

        Ok(Response::builder()
            .status(StatusCode::OK)
            .body(Body::from(json!({ "data": output_str, "error": null }).to_string()))
            .unwrap())
    } else {
        let error_str = str::from_utf8(&output.stderr).unwrap_or_default();

        Ok(Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(Body::from(json!({ "data": null, "error": error_str }).to_string()))
            .unwrap())
    }
}
