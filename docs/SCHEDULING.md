# Task scheduling

Task scheduling is how the idle aspects of the application are handled.
They have each an unique id, but are also always associated with an island (id). This is to ensure that the task is only handled by 'the island that created it'.
Buildings that continously produce resources, such as the mine, schedule a new task after they have produced their resources.
Once that task completes, the building adds the resources to the island and schedules a new task.

Real-time scheduling is tracked on the frontend of the application, where the user can see (to the second) how long it will take for a building to complete its task.
The backend, however, does not track real-time scheduling. Instead, it 'schedules'/keeps a record of the tasks based on the time they should be completed.
The frontend then calculates the time remaining based on the time the task was scheduled and the time it should be completed.
Once the task is completed and the action is performed, the frontend will update the backend that said task has been `handeled`.

## Creating a new task
A task is created by sending a `POST` request to the `/api/task` endpoint with a predefined deadline. The task will be scheduled to be completed at the deadline.
However, the frontend needs to perform a manual check to resync its catalog of pending tasks with the backend. The backend does not notify the frontend of new tasks.
This is because the frontend is normally the one creating tasks and should therefore be aware of the new task before it's submitted to the backend.

After the task is created, the frontend keeps a real-time timer of the task. Once the task is completed,
the frontend will notify the backend that the task has been handled (by setting the `handeled` flag to true).

## Handling a task
To check if a task has been completed, the frontend sends a `GET` request to the `/api/task` endpoint with the task's ID.
A task is considered completed when the `endtime` is before the current datetime. A task is considered cancelled when the
`handeled` flag is set to `true`, but the `endtime` is still in the future.
 
## Resyncing tasks
The frontend should fetch the current pending tasks from the backend every time the user logs in or the page is refreshed.
Listing of tasks is done through the `/api/task/list` endpoint. 
First, all tasks that have been completed since the last logout should be executed. These are retrieved when setting the `handeled` flag to `false` AND
the `is_over` flag to `true`. Once these tasks have been handled (eg the resources have been added to the island), the `handeled` flag should be set to `true` on the backend.

Finally, real-time timers should be started fro all tasks that are not yet completed (`is_over=false` and `handeled=false`) for the given island id.

## Cancelling a task
A task can be cancelled by settings the `handeled` flag to `true`. This will mark the task as cancelled.
The term 'cancelled' is only relevant when the task is not yet completed. Once the task is completed (endtime < now),
it is considered 'handled' and the cancelled state of a task doesn't matter anymore.