import { Component } from 'react';

export default (WrappedComponent) => {
    class withNavCommands extends Component {
        static displayName = 'withNavCommands';

        state = {
            isNavigating: false,
        };

        componentDidMount() {
            this.setState({ isNavigating: false });
            this.commandListener = Navigation.events().registerCommandListener((name, { commandId }) => {
                if (name === 'push' || name === 'pop') {
                    this.setState({ isNavigating: commandId });
                }
            });
            this.commandCompletedListener = Navigation.events().registerCommandCompletedListener(({ commandId }) => {
                if (this.state.isNavigating === commandId) {
                    setTimeout(() => this.setState({ isNavigating: false }), 300);
                }
            });
        }

        componentWillUnmount() {
            this.commandListener.remove();
            this.commandCompletedListener.remove();
        }

        render() {
            const { state: { isNavigating } } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  isNavigating={isNavigating}
                />
            );
        }
    }

    return withNavCommands;
};