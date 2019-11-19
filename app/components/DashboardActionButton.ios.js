import { PureComponent } from 'react';
import withChallenges from 'providers/withChallenges';
import getDashboardActionItems from './DashboardActionItems';

export default withChallenges(class extends PureComponent {
    static displayName = 'DashboardActionButton';

    static propTypes = {
        challenges: propTypes.array,
        onAddIdea: propTypes.func,
    };

    render() {
        const { challenges, onAddIdea } = this.props;
        const size = 56;
        const offset = size / 4;
        return (
            <ActionButton
              buttonColor={pallette.wazokuNavy} bgColor="rgba(0, 0, 0, 0.75)" hideShadow
              offsetY={global.bottomTabsHeight + offset}
              offsetX={offset}
              size={size}
            >
                {getDashboardActionItems({ challenges, onAddIdea })}
            </ActionButton>
        );
    }
});
