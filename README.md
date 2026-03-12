# Required packages
```js
npm install express express-session mysql2 dotenv
```

# TODO:
## Base functionality:
- [x] DB access
- [x] CRUD
- [x] Login page
- [x] Updating specific component
- [ ] Temporary using component
## Features:
- [x] DB init in case it doesn't exist
  - [ ] prompt for admin password?
  - [ ] write password in SHA
- [ ] User management (create, remove etc)
- [ ] Beatuify
- [ ] Generate reports
- [ ] Filtering by type, sorting etc.
- [x] Add component in dialog window
- [ ] ???
## Technical:
- [ ] SHA password encryption
- [x] Remember session with cookies
- [ ] Split express server and other features in separate files
- [ ] Non-admin should have no rights to add, edit or assign components
