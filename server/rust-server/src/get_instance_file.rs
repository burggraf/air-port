use hyper::{Body, Request, Response, StatusCode, header};
use serde_json::json;
use std::fs::File;
use std::io::Read;
use serde::Deserialize;
//use mime_guess::from_path;

use crate::AUTH_TOKEN;

#[derive(Debug, Deserialize)]
struct FileRequest {
    port: String,
    path: String,
}

pub async fn handle_get_instance_file(mut req: Request<Body>, _auth_token: &str) -> Result<Response<Body>, hyper::Error> {
    if let Some(auth_header) = req.headers().get(hyper::header::AUTHORIZATION) {
        if auth_header != AUTH_TOKEN {
            return Ok(Response::builder()
                .status(StatusCode::UNAUTHORIZED)
                .body(Body::from(json!({ "error": "Unauthorized" }).to_string()))
                .unwrap());
        }
    } else {
        return Ok(Response::builder()
            .status(StatusCode::UNAUTHORIZED)
            .body(Body::from(json!({ "error": "No Authorization Header" }).to_string()))
            .unwrap());
    }

    let body_bytes = hyper::body::to_bytes(req.body_mut()).await?;
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    // println!("Received request body: {}", body_str);

    let file_request: FileRequest = match serde_json::from_str(&body_str) {
        Ok(req) => req,
        Err(_) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Body::from(json!({ "error": "Invalid request body" }).to_string()))
                .unwrap());
        }
    };

    let file_path = format!("/home/ubuntu/data/{}/{}", file_request.port, file_request.path);
    match File::open(&file_path) {
        Ok(mut file) => {
            let mut contents = Vec::new();
            file.read_to_end(&mut contents).unwrap();
            // println!("First few bytes of the file: {:?}", &contents[..std::cmp::min(10, contents.len())]);

            let mime_type = mime_guess::from_path(&file_path).first_or_octet_stream();
            
            Ok(Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime_type.as_ref())
                .body(Body::from(contents))
                .unwrap())
        }
         Err(_) => {
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::from(json!({ "error": "File not found" }).to_string()))
                .unwrap())
        }
    }
}
