# API information

### For all api endpoints and their specific documentation, please refer to the Swagger documentation

## Swagger Documentation
Available at `<url>/api/docs` with `APP_SWAGGER_ENABLED=true` set as environment variable when using a local development server.

## General API structure (backend)
For the complete, detailed relationships between entities: please refer to the ER diagram.

Each entity has a Model, a Schema and a Resource class. The Model is lies in the `model` package, in a file with the same name as the entity.
The model is the Mapper for SQLAlchemy and has all column definitions and relationships between other SQLAlchemy models.

A Schema lies in the `resource` package, in a file with the same name as the entity. The class name is the entity name appended with `Schema`.
The Schema defines and parses the JSON representation of the entity. It should function as a JSON to Entity Mapper as well in reverse.
The Schema is mostly a documentation tool that is used by the Swagger documentation.

A Resource lies in the `resource` package, preferably in the same file as the Schema.
The resource functions as an RESTful API endpoint that accepts HTTP requests. As per RESTful spec, it has at most 4 methods for each CRUD operation on
an entity. Each function has `@swagger` decorators with information about what schema is returned / used in what use case / error message.
- `post()` - HTTP `POST` for create
- `get()` - HTTP `GET` for read
- `put()` - HTTP `PUT` for update
- `delete()` - HTTP `DELETE` for removal

A Resource parses the query methods and/or JSON body and manipulates / retrieves the SQLAlchemy Models accordingly.
It functions as both the Controller and the View for an entity.

Endpoints of objects that allow listing of all objects are usually suffixed with `/list` (e.g. `/api/spell/list`).

#### Conventions on API responses
All API responses are JSON objects. Except the `DELETE` method, all HTTP 200 responses will return the object itself rather than a status and/or message.
All non-200 responses will have a `status` key with the value `error` and a `message` key with a human-readable error message.
Please note that the `auth` endpoints don't follow these conventions, as they are not part of the RESTful API. 
For more details, please consult the Swagger documentation.

- `GET` - Unless specified otherwise, requires always an `id` parameter in the **query string**. If the id is not found, it will return a 404. It will always return the object schema on HTTP 200. No status key is then returned.
- `POST` - Requires a JSON body with the object schema. **No id** (Primary Key of the entity) has to be present in the request body. **ALL** other fields are **mandatory** (unless specified otherwise). It will automatically be assigned and returned in the response body. It will return the object schema on HTTP 200. It will return a 400 if the object is not valid.
- `PUT` - Requires a JSON body with the object schema. An **id (PK) has to be present** in the **request body**. It will return the object schema on HTTP 200. It will return a 400 if the object is not valid. It will return a 404 if the object is not found.
- `DELETE` - Requires an `id` parameter in the **query string**. It will return a HTTP 200 with `status` key `success` if the object is deleted. It will return a 404 if the object is not found.

#### A special note on registering new endpoints
Each RESTful endpoint (=Resource) should be registered with an `attach_resource()` function defined in the 
resource file. This method should be mostly copied over from other examples, and be modified accordingly. 
Finally, add this function to the `resource.__init__#attach_resources()` by importing it locally and invoking it.

The reason this is done this way is because the current flask-restful-swagger-3 package does not support multiple Flask route
blueprints. So they all have to be bundled to one. The package is the only that adds Swagger 3 support, but is unfortunately unmaintained and broken in many ways.
