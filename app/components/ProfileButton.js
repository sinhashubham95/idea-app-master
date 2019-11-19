import { PureComponent } from 'react';

export default class extends PureComponent {
    static displayName = 'ProfileButton';

    static propTypes = {
        first_name: propTypes.string,
        display_name: propTypes.string,
        thumbnail: propTypes.string,
        onPress: propTypes.func,
    }

    render() {
        const { onPress, thumbnail, first_name, display_name } = this.props;
        return (
            <TouchableOpacity onPress={onPress}>
                {thumbnail ? (
                    <FastImage
                      source={{ uri: thumbnail }}
                      style={[Styles.profileImageNav, Styles.profileImageNavAndroid]}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                ) : (
                    <View style={[Styles.avatarPlaceholderNav, Styles.profileImageNavAndroid]}>
                        <Text style={Styles.avatarInitialNav}>{first_name || display_name ? (first_name || display_name)[0].toUpperCase() : ''}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }
}
