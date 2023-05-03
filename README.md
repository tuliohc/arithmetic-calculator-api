# Calculator API

This API provides several routes to perform math operations, including addition, subtraction, multiplication, division, square root, and random string. It also allows users to perform sign-in and get their balance. The API supports pagination, sorting, and filtering.


## Project Setup

1. Make sure you have Docker installed
2. Clone this repository to your local machine

3. Create a .env file in the root of the project

    ```
    PORT=3000
    API_VERSION=v1
    
    JWT_SECRET=truenorth
    JWT_TOKEN_EXPIRATION_TIME=20m
    
    MONGO_URL=mongodb://db:27017/truenorth
    ```
4. Run `npm run docker:build` to build a docker image
5. Run `npm run docker:up` to start the containers



### IMPORTANT!!!
- After the installation, make sure you run the seed route to add Users and Operations to the database
```
POST http://localhost:3000/dev/api/v1/seed
```
The following seeds will be synchronized:

```
// users
[  
      {    
        "_id": "6450f05115b430b0ec783a98",
        "username": "user@mail.com",
        "password": "123456",
        "balance": "100"
      }
]
```

```
// operations
[  
      {    
        "_id": "6450f420f1713f4543b02821",
        "type": "addition",    
        "cost": 1.0  
      },  
      {  
        "_id": "6450f420f1713f4543b02822",  
        "type": "subtraction",    
        "cost": 1.0  
      },  
      {    
        "_id": "6450f420f1713f4543b02823",
        "type": "multiplication",    
        "cost": 2.0  
      },  
      {    
        "_id": "6450f420f1713f4543b02824",
        "type": "division",    
        "cost": 2.0  
      },  
      {    
        "_id": "6450f420f1713f4543b02825",
        "type": "square_root",    
        "cost": 3.0  
      },
      {    
        "_id": "6450f420f1713f4543b02826",
        "type": "random_string",    
        "cost": 1.0  
      }
]
```

## API routes

### Signin

To sign in, you need to pass the `username` and `password` in the request body.

- Route: `POST http://localhost:3000/dev/api/v1/users/signin`
- Example values: `{ "username": "user@mail.com", "password": "123456" }` 
- Expected response: 
```
{
    "message": "Sign-in successful"
}
```


### Get user balance

To get the user's balance, you need to pass the Bearer token collected from the sign-in request.

- Route: `GET http://localhost:3000/dev/api/v1/users/balance`
- Example: `http://localhost:3000/dev/api/v1/users/balance`
- Expected response: `{ "balance": "100" }` 


### Perform operations

To perform operations, you need to pass the Bearer token collected from the sign-in request, and specify the type of operation you want to perform. 

- Route: `POST http://localhost:3000/dev/api/v1/operations/:type`
- type options: `addition, subtraction, multiplication, division, square_root, and random_string`
- Example: `http://localhost:3000/dev/api/v1/operations/addition`
- Example body: `{ "params": [10, 5] }`
- Expected response: `{ "result": "15", "balance": "94" }`


### Soft delete records

To soft-delete a record, you need to pass the Bearer token collected from the sign-in request, and specify the ID of the record you want to delete.

- Route: `DELETE http://localhost:3000/dev/api/v1/records/:id`
- Example: `http://localhost:3000/dev/api/v1/records/6450f571eb3295d5b3d3c22e`

### Get user records

To get the records of the authenticated user, you can use the following route. You can also include pagination, sorting, and filtering options.

- Route: `GET http://localhost:3000/dev/api/v1/records`
- Expected response: 
    ```json
    { 
      "page": 1, 
      "perPage": 10, 
      "totalCount": 1, 
      "data": [
        {
          "_id": "6450f571eb3295d5b3d3c22e",
          "user": "6450f05115b430b0ec783a98",
          "amount": "1",
          "userBalance": "88",
          "operationResponse": "5",
          "deletedAt": "2023-05-02T14:03:19.405Z",
          "date": "2023-05-02T11:35:13.024Z",
          "operation_type": "subtraction"
        },
      ] 
    }
    ``` 
* Other examples:    
    - Pagination: `?page=1&perPage=10`
    - Sorting: `?sort=date:asc`
    - Filtering: `?search=addition`
    
    