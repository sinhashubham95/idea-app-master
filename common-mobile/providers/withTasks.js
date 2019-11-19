import { Component } from 'react';
import TasksStore from '../stores/tasks-store';

export default (WrappedComponent) => {
    class withTasks extends Component {
        static displayName = 'withTasks';

        static propTypes = {
        }

        state = {
            isLoading: TasksStore.isLoading,
            tasks: TasksStore.getTasks(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(TasksStore, 'change', () => {
                this.setState({
                    isLoading: TasksStore.isLoading,
                    tasks: TasksStore.getTasks(),
                    error: TasksStore.error,
                });
            });

            this.listenTo(TasksStore, 'loaded', () => {
                if (this.wrappedComponent.onTasksLoaded) this.wrappedComponent.onTasksLoaded();
            });

            this.listenTo(TasksStore, 'problem', () => {
                this.setState({
                    isLoading: TasksStore.isLoading,
                    error: TasksStore.error,
                });
                if (this.wrappedComponent.onError) this.wrappedComponent.onError(TasksStore.error);
            });
        }

        render() {
            const {
                state: { isLoading, tasks, error },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  error={error}
                  tasksLoading={isLoading}
                  tasks={tasks}
                />
            );
        }
    }

    return withTasks;
};
