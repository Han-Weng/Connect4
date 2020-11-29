# Connect4

I plan on making a connect multiplayer and plan on adding future games like poker and Chess
, both with multiplayers as well


Your server API does not always adhere to REST principles (inappropriate route methods, incorrect identification of resources. Example: POST /search instead of GET /users?query1=...&query2=...) and does not support JSON format.


User Accounts::========================================================================================================================

- Login / Register: Partial. No check for password match when logging in

- Send a friend request to other users of the application: Partial. Can send request to yourself, can send multiple requests to the same person [

- Navigate to any of the friends' profiles: Missing. No links to profiles

- Remove user from the friend list: Partial. Results in errors

- Set profile to private / public: Missing. Cannot save changes

- Creating new games: Partial. Cannot specify visibility of the game (public / friends only / private)

- View history of games played and watch the replay: Partial. Doesn't always work. Some games show up in both active and history

Viewing a User Profile:========================================================================================================================

- View a summary of the statistics for the user: Incomplete. Does not match with game history

- View a summary of the last 5 games played: Partial. Does not properly display the winner


Playing Games: Partial. Game doesn't end once the winner is determined, no support for forfeiting, doesn't update dynamically.
