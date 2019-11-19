import { Component } from 'react';
import withChallenges from 'providers/withChallenges';
import getDashboardActionItems from './DashboardActionItems';

export default withChallenges(class extends Component {
    static displayName = 'DashboardActionButton';

    static propTypes = {
        challenges: propTypes.array,
        onAddIdea: propTypes.func,
    };

    state = {};

    render() {
        const { onAddIdea, challenges } = this.props;
        const size = 56;
        const offset = size / 4;
        return (
            <View
              style={[styles.container,
                  this.state.active ? {
                      left: 0, top: 0, right: 0, bottom: 0,
                  } : {
                      right: offset,
                      bottom: global.bottomTabsHeight + offset,
                      width: size,
                      height: size,
                  }]}
            >
                <ActionButton
                  buttonColor={pallette.wazokuNavy} bgColor="rgba(0, 0, 0, 0.75)" hideShadow
                  offsetY={this.state.active ? global.bottomTabsHeight + offset : 0}
                  onPress={() => this.setState({ active: true })}
                  onReset={() => setTimeout(() => this.setState({ active: false }), 250)}
                  ref={c => this.actionButton = c}
                  offsetX={this.state.active ? offset : 0}
                  size={size}
                >
                    {getDashboardActionItems({ challenges, onAddIdea })}
                </ActionButton>
            </View>
        );
    }
});

const styles = {
    container: {
        backgroundColor: 'transparent',
        position: 'absolute',
    },
};