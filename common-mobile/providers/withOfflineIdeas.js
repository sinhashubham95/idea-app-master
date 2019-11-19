import { Component } from 'react';
import OfflineIdeasStore from '../stores/offline-ideas-store';

export default (WrappedComponent) => {
    class withOfflineIdeas extends Component {
        static displayName = 'withOfflineIdeas';

        static propTypes = {
        }

        state = {
            ideas: OfflineIdeasStore.getIdeas(),
        };

        componentDidMount() {
            ES6Component(this);

            this.listenTo(OfflineIdeasStore, 'change', () => {
                this.setState({
                    ideas: OfflineIdeasStore.getIdeas(),
                });
            });

            this.listenTo(OfflineIdeasStore, 'saved', () => {
                if (this.wrappedComponent.onOfflineIdeasSaved) this.wrappedComponent.onOfflineIdeasSaved(OfflineIdeasStore.savedIdea);
            });
        }

        render() {
            const {
                state: { ideas },
            } = this;
            return (
                <WrappedComponent
                  ref={c => this.wrappedComponent = c}
                  {...this.props}
                  offlineIdeas={ideas}
                />
            );
        }
    }

    return withOfflineIdeas;
};
