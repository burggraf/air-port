use hyper::{Body, Request, Response};
use walkdir::WalkDir;
// use std::fs;

pub async fn handle_get_instance_files(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    let query = req.uri().query().unwrap_or("");
    let params: Vec<&str> = query.split('&').collect();
    let port_param = params.iter().find(|&&param| param.starts_with("port="));

    if let Some(port_param) = port_param {
        let port = &port_param[5..];
        let dir_path = format!("/home/ubuntu/data/{}", port);

        let walker = WalkDir::new(&dir_path).into_iter();
        let mut file_paths = vec![];

        for entry in walker.filter_map(|e| e.ok()) {
            let path = entry.path();
            if let Ok(strip_path) = path.strip_prefix(&dir_path) {
                // Determine file or directory
                let file_type = if entry.file_type().is_file() { "f" } else { "d" };

                // Get file size (0 for directories)
                let size = if file_type == "f" {
                    entry.metadata().map(|m| m.len()).unwrap_or(0)
                } else {
                    0
                };

                let formatted_entry = format!("./{} |{} |{}", strip_path.display(), file_type, size);
                file_paths.push(formatted_entry);
            }
        }

        let body = Body::from(file_paths.join("\n"));
        Ok(Response::new(body))
    } else {
        let body = Body::from("Port parameter is missing");
        Ok(Response::new(body))
    }
}
