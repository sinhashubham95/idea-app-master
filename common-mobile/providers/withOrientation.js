import { Component } from 'react';
import { Dimensions } from 'react-native';

function isPortrait() {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
}

function isLandscape() {
    const dim = Dimensions.get('screen');
    return dim.width >= dim.height;
}

export default (WrappedComponent) => {
    class withOrientation extends Component {
        state = {
            DeviceHeight: Dimensions.get('window').height,
            DeviceWidth: Dimensions.get('window').width,
            isPhone: !DeviceInfo.isTablet(),
            isTablet: DeviceInfo.isTablet(),
            isPortrait: isPortrait(),
            isLandscape: isLandscape(),
        }

        componentWillMount() {
            // Event Listener for orientation changes
            Dimensions.addEventListener('change', this.onChange);
        }

        componentWillUnmount() {
            Dimensions.removeEventListener('change', this.onChange);
        }

        onChange = _.debounce(() => {
            this.setState({
                DeviceHeight: Dimensions.get('window').height,
                DeviceWidth: Dimensions.get('window').width,
                isPhone: !DeviceInfo.isTablet(),
                isTablet: DeviceInfo.isTablet(),
                isPortrait: isPortrait(),
                isLandscape: isLandscape(),
            });
        }, 20);

        render() {
            return (
                <WrappedComponent
                  {...this.props}
                  {...this.state}
                />
            );
        }
    }

    return withOrientation;
};
