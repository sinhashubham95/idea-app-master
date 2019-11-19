import React, { Component } from 'react';

const LottieToggle = class extends Component {
    static displayName = 'LottieToggle';

    static propTypes = {
        value: propTypes.bool.isRequired,
        source: propTypes.object.isRequired,
        style: propTypes.object.isRequired,
        duration: propTypes.number,
    }


    state = {
        animatedValue: new Animated.Value(this.props.value ? 1 : 0),
    }

    componentWillReceiveProps(newProps) {
        if (newProps.value !== this.props.value) {
            Animated.timing(this.state.animatedValue, {
                toValue: newProps.value ? 1 : 0,
                duration: this.props.duration || 700,
                easing: newProps.value ? Easing.linear : Easing.out(Easing.cubic),
            }).start();
        }
    }

    render() {
        return (
            <Animation
              progress={this.state.animatedValue}
              style={this.props.style}
              source={this.props.source}
            />
        );
    }
};

module.exports = LottieToggle;
