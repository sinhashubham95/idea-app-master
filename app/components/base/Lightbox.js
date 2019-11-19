import withOrientation from 'providers/withOrientation';

export default (WrappedComponent) => {
    class Lightbox extends React.Component {
        static displayName = 'Lightbox';

        static propTypes = {
            duration: propTypes.number,
            componentId: propTypes.string,
            DeviceHeight: propTypes.number,
        };

        state = {
            slideInFromTop: {
                easing: Animations.deceleration,
                from: { translateY: -DeviceHeight },
                to: { translateY: 0 },
            },
            fadeInBackground: {
                from: { backgroundColor: 'rgba(0, 0, 0, 0)' },
                to: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            },
        };

        dismiss = () => {
            this.setState({
                slideInFromTop: {
                    easing: Animations.deceleration,
                    from: { translateY: 0 },
                    to: { translateY: -DeviceHeight },
                },
                fadeInBackground: {
                    from: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
                    to: { backgroundColor: 'rgba(0, 0, 0, 0)' },
                },
            });
            setTimeout(() => Navigation.dismissOverlay(this.props.componentId), this.props.duration || 500);
        }

        render() {
            const { state: { slideInFromTop, fadeInBackground }, props: { duration, DeviceHeight } } = this;
            return (
                <Animatable.View
                  duration={duration || 500}
                  animation={fadeInBackground}
                >
                    <Animatable.View
                      style={[Styles.lightboxOuter, { height: DeviceHeight - 40 }]} useNativeDriver duration={duration || 500}
                      animation={slideInFromTop}
                      easing={slideInFromTop.easing}
                    >
                        <WrappedComponent
                          dismiss={this.dismiss}
                          {...this.props}
                        />
                    </Animatable.View>
                </Animatable.View>
            );
        }
    }

    return withOrientation(Lightbox);
};
