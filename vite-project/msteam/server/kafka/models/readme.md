How to generated typescript code for your proto file
Get the proto files from https://github.com/DubberSoftware/dubber-event-schemas
Run the following command protoc --plugin="./node_modules/.bin/protoc-gen-ts_proto" --ts_proto_opt=esModuleInterop=true --ts_proto_opt=snakeToCamel=false --proto_path="./src/server/kafka/models/" --ts_proto_out="./src/server/kafka/models" dubber_meeting_event.proto