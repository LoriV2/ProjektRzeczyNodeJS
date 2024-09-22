# ProjektRzeczyNodeJS - Yapp2go

This project, **Yapp2go**, is a Node.js-based web application developed during my final year of technical school. The front-end is built using **Pug**, **SCSS**, **CSS**, and **JavaScript**.

### Main Features:

#### Available for all users:
- **Browse Articles**: Users can freely explore various articles on the site.
- **Commenting**: Visitors can leave comments under articles.
- **User Registration**: A registration form is available on the `/Rejestracja` page.
- **Login**: Users can log in via the `/login` page.

#### Available for logged-in users:
- **All features mentioned above**.
- **Display Username**: Logged-in users will see their username attached to their comments.

#### Available for staff members:
- **All features mentioned above**.
- **Create Articles**: Staff can publish articles, including HTML tags for proper rendering in article views.
- **Delete Articles**: Staff can delete articles through the "All Articles" view.
- **Delete Comments**: A "delete" button (X) appears next to each comment for staff moderation.

#### Available for administrators:
- **All features mentioned above**.
- **Manage User Roles**: Administrators can change user roles in the admin panel.

## Key Technologies Used:
- **Node.js** with the following libraries:
  - Express.js
  - Express-session.js
  - Passport.js
  - Passport-local.js
  - Pug.js
  - dotenv
  - connect-flash
  - sass
  - scss
  - Crypto.js
  - firebase-admin

## File Structure Overview:

### Key Files:
- **index.js**: The main server file connecting to Firebase and handling data sent to subpages. Users cannot access this file during operation.
- **DatabaseHandl.js**: Contains a single function for database queries.
- **views folder**: Holds all front-end pages and design elements sent to the user.
- **node_modules folder**: Stores all installed libraries.

## Challenges & Future Plans:
The graphical design of the project has significantly improved compared to my earlier works, though it still leaves room for improvement. One notable issue is session handling, which doesn't function properly due to a lack of knowledge about asynchronous programming at the time.

In the future, I plan to:
- Add more features,
- Enhance the visual design,
- Migrate the project to more powerful servers.

This project represents my progress in web development and serves as a learning experience, particularly with Node.js and real-time web applications.
