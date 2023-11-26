# tests/integration/lab-9-s3.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`Hello S3!`

# We expect to get back an HTTP 201 and capture URL
HTTP/1.1 201
[Captures]
url: header "Location"

# Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# confirm that server returns 200 and type and body is correct
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# Delete the fragment using URL
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

#confirm that server returns 200
HTTP/1.1 200

# Trying to get the fragment again after deletion
GET {{url}}
[BasicAuth]
user1@email.com:password1

#confirming that server returns 404
HTTP/1.1 404


