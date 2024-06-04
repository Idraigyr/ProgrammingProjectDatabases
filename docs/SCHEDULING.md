# Task scheduling

## Backend
### Single Tasks
Task scheduling is how idle aspects that require a single task to be completed are executed.
These tasks are scheduled to be completed at a certain deadline. Once the deadline is reached, the task is considered completed.
These are so called 'single tasks', for example building a new building or upgrading an existing building.
Periodic tasks are handled differently, see below.

Single tasks have each an unique id, but are also always associated with an island (id). This is to ensure that the task is only handled by 'the island that created it'.
Single tasks are not required to be bound to a building (for more flexibility), but are most commonly associated with a building.

Real-time tracking of the deadline is done on the frontend of the application, where the user can see (to the second) how long it will take for a task to complete.
The backend, however, does not track real-time scheduling. Instead, it 'schedules'/keeps a record of the tasks based on the time they should be completed.
When the frontend boots up (the player logs in), then the frontend calculates the time remaining time until completion based on the endtime timestamp.
Once the task is completed and the 'on complete' action is performed, the frontend send a `DELETE` to the task endpoint to delete said task.

#### Creating a new task
A task is created by sending a `POST` request to the `/api/task` endpoint with a predefined deadline. The task will be scheduled to be completed at the deadline.
However, the frontend needs to perform a manual check to resync its catalog of pending tasks with the backend. The backend does not notify the frontend of new tasks.
This is because the frontend is normally the one creating tasks and should therefore be aware of the new tasks (that are relevant to it) before it's submitted to the backend.

After the task is created, the frontend keeps a real-time timer of the task. Once the task is completed,
the frontend will 'notify' the backend that the task has been handled (by deleting the task in the backend).

#### Resyncing tasks
The frontend should fetch the current pending tasks from the backend every time the user logs in or the page is refreshed.
Listing of tasks is done through the `/api/task/list` endpoint. 
First, all tasks that have been completed since the last logout should be executed. These are retrieved when setting the `is_over` flag to `true`. 
Once these tasks have been handled (eg the resources have been added to the island), the tasks should be deleted from the backend.

Finally, real-time timers should be started for all tasks that are not yet completed (`is_over=false`) for the given island id.

#### Cancelling a task
A task can be cancelled by sending a `DELETE` request to the `/api/task` endpoint with the task id.


### Periodic Tasks
Periodic tasks are tasks that are executed on a regular basis. These tasks are not bound to a deadline, and are therefore implemented differently.

These type of tasks are less flexible than single tasks, but are more efficient for tasks that are executed on a regular basis.
When a player logs off, the timestamp is logged into the database. When the player logs in, the frontend calculates the time that has passed since the player last logged off.
This 'delta time' is then used to reward the player with resources that have been produced in the meantime.

An important limitation of this implementation is that tasks must have a certain reward that is based on the time that has passed since the player last logged off.
Periodic tasks that require a more general approach (eg a 'broadcast chat message task' that is executed every 5 minutes) are not supported.

## Frontend

### Types of tasks

There are five types of tasks that are handled by the frontend:
- Crystal mining task
- Gem generation task (in fusion table)
- Gem generation task (in mine)
- Building task
- Building upgrade task

Let's go through each of these tasks and see how they are handled by the frontend.

### High-level overview

- Crystal mining task: The frontend keeps track of the last time the player collected resources from the mine. The frontend calculates the resources that have been produced since the last collection and adds these resources to the player's inventory.
- Gem generation task (in fusion table): The frontend calculates the chance of generating a gem based on the 'fortune' parameter of the fusion table and the number of the put crystals. When a gem is generated, the frontend adds the gem to the player's inventory and sends a .
- Gem generation task (in mine): The frontend calculates the chance of generating a gem based on the 'fortune' parameter of the mine. If a gem is generated, the frontend adds the gem to the player's inventory.

### Creating single tasks

When a player performs an action that requires a task to be created, the frontend sends a `POST` request to the `/api/building_upgrade_task` (in the case of building upgrade or placing a new building) or to the `/api/fuse_task` (in the case of a fuse task) endpoint.
The frontend should also keep track of the deadline of the task, so it can show the user how long it will take for the task to complete.
The frontend contains a timer that is updated in real-time to show the user how long it will take for the task to complete.
When the task is completed, frontend completes the task by performing the action that the task was created for (e.g. upgrading a building, fusing crystals).

### Real-time tracking

As already mentioned, the frontend keeps track of the time remaining until a task is completed. 
This is done by calculating the difference between the current time and the deadline timestamp.
The frontend then updates the timer, to show for some tasks (e.g. buildings in progress) to the user how long it will take for the task to complete.

### Deleting tasks

After each refresh of the page, the frontend should fetch the current pending tasks from the backend. This is done by sending a `GET` request to the `/api/task/list` endpoint.
The tasks are filtered based on the island id and their completion status. If the task is completed, the frontend should delete the task from the backend by sending a `DELETE` request to the `/api/task` endpoint.

### Handling periodic tasks

The main periodic task where information is exchanged between the frontend and the backend is mining. 
Each time the player collects resources from a mine, the frontend sends a `POST` request to the `/api/task` endpoint to update last collected timestamp.
To calculate the resources that have been produced since the last collection, the frontend calculates the difference between the current time and the last collected timestamp.

Other periodic task (random gem generation in mine) is completely handled by frontend. The chance of generating a gem is calculated on the frontend, ans is effected by "fortune" parameter of the mine. If a gem is generated, the frontend sends a `POST` request to the `/api/gem` endpoint to add the gem to the player's inventory.

### Handling single tasks

Single tasks are handled by the frontend in a little bit different way. Each page refresh, the frontend should fetch the current pending tasks from the backend. 
This is done by sending a `GET` request to the `/api/task/list` endpoint. 
Then the frontend should start a real-time timer for each task that is not yet completed.

On the hand of the type of the task (building_upgrade, fuse_task), the frontend should perform different actions when the task is completed: 

- Building upgrade task: The frontend should show a timer above the building and send a `POST` request to the `/api/placeable` endpoint to upgrade the building after the time comes to zero.
- Building task: Works the same as building upgrade task, but the building is created and upgraded to level 1.
- Fuse task: The frontend should show a timer above the fusion and should send a `POST` request to the `/api/gem` endpoint to fuse the crystals.

