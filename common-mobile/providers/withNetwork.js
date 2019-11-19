import { Component } from 'react';

export default (WrappedComponent) => {
    class withNetwork extends Component {
        static displayName = 'withNetwork';

        static propTypes = {
        }

        state = {
            isConnected: NetworkStore.isConnected,
            isAPIRunning: NetworkStore.isAPIRunning,
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(NetworkStore, 'change', () => {
                this.setState({
                    isConnected: NetworkStore.isConnected,
                    isAPIRunning: NetworkStore.isAPIRunning,
                });
                if (this.wrappedComponent.onNetworkChange) this.wrappedComponent.onNetworkChange(!NetworkStore.isConnected || !NetworkStore.isAPIRunning);
            });
        }

        render() {
            const { state: { isConnected, isAPIRunning }, props } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  isConnected={isConnected}
                  isAPIRunning={isAPIRunning}
                  isOffline={!NetworkStore.isConnected || !NetworkStore.isAPIRunning}
                  {...props}
                />
            );
        }
    }

    return withNetwork;
};
