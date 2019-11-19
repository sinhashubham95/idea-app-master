import { PureComponent } from 'react';
import HTML from 'react-native-render-html';

import Anchor from './Anchor';

export default class HTMLTruncator extends PureComponent {
  static displayName = 'HTMLTruncator';

  static propTypes = {
      html: propTypes.string.isRequired,
      showAll: propTypes.bool,
      htmlHeight: propTypes.number,
      toggleAll: propTypes.func,
      onLayout: propTypes.func,
  }

  render() {
      const { html, showAll, htmlHeight, toggleAll, onLayout } = this.props;
      const descTruncateHeight = ((global.proximaNovaRegularLineHeight || 18) * 2 * PixelRatio.getFontScale());
      return (
          <React.Fragment>
              <Flex onLayout={onLayout} style={!showAll && (htmlHeight || 0) > descTruncateHeight ? { height: descTruncateHeight, overflow: 'hidden' } : {}}>
                  <HTML
                    tagsStyles={{ p: { fontFamily: 'ProximaNova-Regular' } }}
                    baseFontStyle={{ fontFamily: 'ProximaNova-Regular', textAlign: 'left' }}
                    html={html}
                    containerStyle={!showAll && (htmlHeight || 0) > descTruncateHeight ? { height: htmlHeight || undefined } : null}
                  />
              </Flex>
              {!showAll && (Math.floor(htmlHeight) || 0) > descTruncateHeight ? (
                  <Anchor style={Styles.cardAnchorText} onPress={() => toggleAll(true)}>{localizedStrings.more}</Anchor>
              ) : showAll ? <Anchor style={Styles.cardAnchorText} onPress={() => toggleAll(false)}>{localizedStrings.less}</Anchor> : null}
          </React.Fragment>
      );
  }
}