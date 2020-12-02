# Connect4

I plan on making a connect multiplayer and plan on adding future games like poker and Chess
, both with multiplayers as well


Your server API does not always adhere to REST principles (inappropriate route methods, incorrect identification of resources. Example: POST /search instead of GET /users?query1=...&query2=...) and does not support JSON format.


User Accounts::========================================================================================================================


- Creating new games: Partial. Cannot specify visibility of the game (public / friends only / private)

Viewing a User Profile:========================================================================================================================

- View a summary of the statistics for the user: Incomplete. Does not match with game history

- View a summary of the last 5 games played: Partial. Does not properly display the winner


create game option
Remove user from the friend list: Partial. Results in errors
