# GitTwitter API Specifications

Create the backend for a social network app.


### Users & Authentication
- Authentication will be ton using JWT/cookies
  * JWT and cookie should expire in 30 days
- User registration
  * Register as a "user" 
  * Once registered, a token will be sent along with a cookie (token = xxx)
  * Passwords must be hashed
- User login
  * User can login with email and password
  * Plain text password will compare with stored hashed password
  * Once logged in, a token will be sent along with a cookie (token = xxx)
- User logout
  * Cookie will be sent to set token = none
- Get user
  * Route to get the currently logged in user (via token)
- Password reset (lost password)
  * User can request to reset password
  * A hashed token will be emailed to the users registered email address
  * A put request can be made to the generated url to reset password
  * The token will expire after 10 minutes
- Update user info
  * Authenticated user only
  * Separate route to update password


### Profile
- List all profile in the database
   * Pagination
   * Select specific fields in result
   * Limit number of results
   * Filter by fields
- Get single profile
- Create/Update a profile
  * Authenticated users only
  * Only one profile per user
  * Field validation via Mongoose
  - Upload a profile image
  * Owner only
  * Photo will be uploaded to local filesystem
  - Delete a profile image
  * Owner only
  * Photo will be uploaded to local filesystem
- Update profile
  * Owner only
  * Validation on update
- Delete profile
  * Owner only
- View other profile
    
  ### Get github repos from Github
- Add your github username to get github repos in your profile
  
  ### Follow other users
- Follow another profile/user
- See your follower list
- See your following list


  ### Education/Experience to your profile
- Add an education/experience
  * Owner only
- Add an education/experience
  * Owner only
- Delete an education/experience
  * Owner only  


### Notifications
- Get a notification if someone follows you
- Get a notification if someone likes your post
- Get a notification if someone comment your post

### Posts
- List all posts for profile
- List all posts in general
  * Pagination, filtering, etc
- Get single post
- Create new post
  * Authenticated users only
  * Only the owner can create a post for a profile
- Update post
  * Owner only
- Delete post
  * Owner only


  
### Comments an likes
- Like post
  * Once only
  * See who has liked your post
- Comment on a post
  * Authenticated users only
  * See who has liked your post
- Delete a comment 
  * Owner only


  
### Delete Account
  * Owner only
  * On deleting ,the likes of owner will not be counted.
  * On deleting ,owner comment will not be shown.
  * Owner will not be showing in anyones follower or following list

## Security
- Encrypt passwords and reset tokens
- Prevent cross site scripting - XSS
- Add a rate limit for requests of 100 requests per 10 minutes


## Documentation
- Use Postman to create documentation
- Use docgen to create HTML files from Postman
- Add html files as the / route for the api

## Deployment on Amazon Web Services


