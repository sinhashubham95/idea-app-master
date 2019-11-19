import { PureComponent } from 'react';

export default class extends PureComponent {
  static displayName = 'LoadingOverlay';

  static propTypes = {
      componentId: propTypes.string,
  };

  render() {
      return (
          <View style={{ position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.5)', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
              <Loader />
          </View>
      );
  }
}
