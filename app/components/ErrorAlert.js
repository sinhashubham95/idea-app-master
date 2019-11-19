// import propTypes from 'prop-types';
import React, { Component } from 'react';
import Collapsible from 'react-native-collapsible';

export default class ErrorAlert extends Component {
    static displayName = 'ErrorAlert';

    static propTypes = {
        error: propTypes.string,
        error2: propTypes.string,
        error3: propTypes.string,
        drawBehindNav: propTypes.bool,
    };

    state = {
        collapsed: true,
        error: '',
    };

    componentWillReceiveProps(props) {
        let error;
        if (props.error && this.props.error !== props.error && props.error !== this.state.error) {
            error = props.error;
        } else if (props.error2 && this.props.error2 !== props.error2 && props.error2 !== this.state.error) {
            error = props.error2;
        } else if (props.error3 && this.props.error3 !== props.error3 && props.error3 !== this.state.error) {
            error = props.error3;
        }
        if (error) {
            this.setState({ collapsed: false, error });
            if (this.collapseTimer) clearTimeout(this.collapseTimer);
            this.collapseTimer = setTimeout(() => {
                this.setState({ collapsed: true, error: '' });
                this.collapseTimer = null;
            }, 3000);
        }
    }

    componentWillUnmount() {
        if (this.collapseTimer) {
            clearTimeout(this.collapseTimer);
        }
    }

    render() {
        const {
            props: { drawBehindNav },
            state: { collapsed, error },
        } = this;

        return (
            <Collapsible
              collapsed={collapsed}
              style={[
                  Styles.pl5,
                  Styles.pr5,
                  Styles.errorHeader,
                  drawBehindNav ? { paddingTop: 50, height: 100 } : {},
              ]}
            >
                <Text style={Styles.errorHeaderText}>{error}</Text>
            </Collapsible>
        );
    }
}
