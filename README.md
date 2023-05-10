# Calculator API

This API provides several routes to perform math operations, including addition, subtraction, multiplication, division, square root. It also collects a random string from a 3rd party API. It also allows users to perform sign-in (using a cookie based httpOnly authentication) and get their balance. The API supports pagination, sorting, and filtering.


## To use this API with the client, check out [arithmetic-calculator-client](https://github.com/tuliohc/arithmetic-calculator-client)


## Project Setup

1. Make sure you have [Docker](https://docs.docker.com/get-docker/) installed.
2. Clone this repository to your local machine (main branch).

3. Optional: create a .env file in the root of the project .

    ```
    PORT=3000
    API_VERSION=v1
    
    JWT_SECRET=truenorth
    # JWT_TOKEN_EXPIRATION_TIME is defined in minutes
    JWT_TOKEN_EXPIRATION_TIME=120   
    
    MONGO_URL=mongodb://db:27017/truenorth

    # make sure the client is running in the same host and port
    CLIENT_URL=http://localhost:3001
    ```
4. Run `npm run docker:build` to build a docker image.
5. Run `npm run docker:up` to start the containers.

## Project Test

- Run `npm run test` to run the tests.
- Run `npm run test:coverage` to get the test coverage.


### IMPORTANT!!!
- After the installation, make sure you run the seed route to add Users and Operations to the database. If you want to add some users, you can edit the `/src/seed/users-seed.json` file.
    
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
            "cost": 4.0  
          }
    ]
    ```
- If you run out of credits to perform operations, just run the seed request again.

## API routes

### SignIn

To sign in, you need to pass the `username` and `password` in the request body.

- Route: `POST http://localhost:3000/dev/api/v1/users/signin`
- Example body: `{ "username": "user@mail.com", "password": "123456" }` 
- Expected response: 
```
{
    "message": "Sign-in successful"
}
```


### Get user balance

To get the user's balance, you don't need to pass a Bearer token. The auth token will be sent from the cookies stored after the sign-in in a httpOnly secure format.

- Route: `GET http://localhost:3000/dev/api/v1/users/balance`
- Example: `http://localhost:3000/dev/api/v1/users/balance`
- Expected response: `{ "balance": "100" }` 


### Perform operations

To perform operations, you need to specify the type of operation you want to perform. The auth token will be sent from the cookies.

- Route: `POST http://localhost:3000/dev/api/v1/operations/:type`
- type options: `addition, subtraction, multiplication, division, square_root, and random_string`
* Example 1: (Binary Operations: addition, subtraction, multiplication, division)
    - Request: `http://localhost:3000/dev/api/v1/operations/addition`
    - Example body: `{ "params": [10, 5] }`
    - Expected response: `{ "result": "15", "cost": "1", "balance": "94" }`
    
* Example 2: (Unary Operations: square_root)
    - Request: `http://localhost:3000/dev/api/v1/operations/square_root`
    - Example body: `{ "params": [9] }`
    - Expected response: `{ "result": "3", "cost": "3", "balance": "93" }`

* Example 3: (random_string)
    - Request: `http://localhost:3000/dev/api/v1/operations/square_root`
    - Expected response: `{ "result": "29389238", "cost": "4", "balance": "90" }`


### Soft delete records

To soft-delete a record, you need to specify the ID of the record you want to delete. The auth token will be sent from the cookies.

- Route: `DELETE http://localhost:3000/dev/api/v1/records/:id`
- Example: `http://localhost:3000/dev/api/v1/records/6450f571eb3295d5b3d3c22e`

### Get user records

To get the records of the authenticated user, you can use the following route. You can also include pagination, sorting, and filtering options. The auth token will be sent from the cookies.

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
          "operationType": "subtraction"
        },
      ] 
    }
    ``` 
* Other examples:    
    - Pagination: `?page=1&perPage=10` (if you don't pass this query params, by default it will return 1 page and 10 elements max)
    - Sorting: `?sort=date:asc` (you can sort by "date", "amount" and "operationType")
    - Filtering: `?search=addition` (you can type whatever you want, and it will search for operation, balance and operationResponse)
    
    
   
### SignOut

To sign out, you just need to use the following route. The server will send back a set-cookie response to clear the auth cookie. So next time you try to request a protected route, you will get a 401 Unauthorized.

- Route: `POST http://localhost:3000/dev/api/v1/users/signout`
- Expected response: 
```
{
    "message": "Sign-out successful"
}
``` 
