mod create_project;
mod create_instance;
mod remove_project;
mod create_user;
mod remove_user;
mod catch_all_handler;
mod get_instance_files;
mod get_instance_file;
mod update_litestream;
mod get_litestream_generations;
mod pitr;
mod setup_marmot;
mod sync;
mod change_version;
mod update_route;
mod configure_server;
mod get_disk_space;

use std::convert::Infallible;
use hyper::{Body, Request, Response, Server};
use hyper::service::{make_service_fn, service_fn};

const AUTH_TOKEN: &str = "your_predefined_auth_token";  // Replace with your actual token

async fn offline_handler(_req: hyper::Request<Body>) -> Result<Response<Body>, hyper::Error> {
    Ok(Response::new(Body::from("This application is currently offline")))
}

async fn maintenance_handler(_req: hyper::Request<Body>) -> Result<Response<Body>, hyper::Error> {
    Ok(Response::new(Body::from("This application is in maintenance mode")))
}

#[tokio::main]
async fn main() {
    let main_addr = ([0, 0, 0, 0], 5000).into();
    let offline_addr = ([0, 0, 0, 0], 9999).into();
    let maintenance_addr = ([0, 0, 0, 0], 9998).into();

    // Main server
    let main_service = make_service_fn(|_conn| async {
        Ok::<_, hyper::Error>(service_fn(request_handler))
    });
    let main_server = Server::bind(&main_addr).serve(main_service);

    // Offline server
    let offline_service = make_service_fn(|_conn| async {
        Ok::<_, Infallible>(service_fn(offline_handler))
    });
    let offline_server = Server::bind(&offline_addr).serve(offline_service);

    // Maintenance server
    let maintenance_service = make_service_fn(|_conn| async {
        Ok::<_, Infallible>(service_fn(maintenance_handler))
    });
    let maintenance_server = Server::bind(&maintenance_addr).serve(maintenance_service);

    println!("Main server listening on http://{}", main_addr);
    println!("Offline server listening on http://{}", offline_addr);
    println!("Maintenance server listening on http://{}", maintenance_addr);

    let _ = tokio::join!(
        main_server,
        offline_server,
        maintenance_server,
    );
}
// #[tokio::main]
// async fn main() {
//     let addr = ([0, 0, 0, 0], 5000).into();

//     let make_svc = make_service_fn(|_conn| async {
//         Ok::<_, hyper::Error>(service_fn(request_handler))
//     });

//     let server = Server::bind(&addr).serve(make_svc);

//     println!("Listening on http://{}", addr);

//     if let Err(e) = server.await {
//         eprintln!("server error: {}", e);
//     }
// }

async fn request_handler(req: Request<Body>) -> Result<Response<Body>, hyper::Error> {
    println!("req.uri().path(): {}",req.uri().path());
    match (req.uri().path(), req.method()) {
        ("/createproject", &hyper::Method::POST) => {
            create_project::handle_create_project(req, AUTH_TOKEN).await
        },
        ("/createinstance", &hyper::Method::POST) => {
            create_instance::handle_create_instance(req, AUTH_TOKEN).await
        },
        ("/removeproject", &hyper::Method::POST) => {
            remove_project::handle_remove_project(req, AUTH_TOKEN).await
        },
        ("/createuser", &hyper::Method::POST) => {
            create_user::handle_create_user(req, AUTH_TOKEN).await
        },
        ("/removeuser", &hyper::Method::POST) => {
            remove_user::handle_remove_user(req, AUTH_TOKEN).await
        },
        ("/getinstancefiles", &hyper::Method::GET) => {
            get_instance_files::handle_get_instance_files(req).await
        },        
        ("/getinstancefile", &hyper::Method::POST) => {
            get_instance_file::handle_get_instance_file(req, AUTH_TOKEN).await
        },
        ("/updatelitestream", &hyper::Method::POST) => {
            update_litestream::handle_update_litestream(req).await
        },
        ("/getlitestreamgenerations", &hyper::Method::POST) => {
            get_litestream_generations::handle_get_litestream_generations(req, AUTH_TOKEN).await
        },
        ("/pitr", &hyper::Method::POST) => {
            pitr::handle_pitr(req).await
        },
        ("/setupmarmot", &hyper::Method::POST) => {
            setup_marmot::handle_setup_marmot(req, AUTH_TOKEN).await
        },
        ("/sync", &hyper::Method::POST) => {
            sync::handle_sync(req, AUTH_TOKEN).await
        },
        ("/changeversion", &hyper::Method::POST) => {
            change_version::handle_change_version(req, AUTH_TOKEN).await
        },
        ("/updateroute", &hyper::Method::POST) => {
            update_route::handle_update_route(req).await
        },
        ("/configureserver", &hyper::Method::POST) => {
            configure_server::handle_configure_server(req).await
        },
        ("/getdiskspace", &hyper::Method::POST) => {
            get_disk_space::handle_get_disk_space(req, AUTH_TOKEN).await
        },
        _ => catch_all_handler::handle_catch_all(req).await
    }
}

