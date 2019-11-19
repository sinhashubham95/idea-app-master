import propTypes from 'prop-types';
import React, { Component } from 'react';
import { FlatInput } from './TextInput';

const Select = class extends Component {
    displayName: 'Select'

    constructor(props, context) {
        super(props, context);
        this.state = {};
    }

    isSelected = (i) => {
        const { multiple } = this.props;
        const value = this.props.value || [];
        return multiple ? value.indexOf(i) !== -1 : value == i;
    };

    setItem = (i, selected) => {
        const { multiple, value, onChange } = this.props;
        if (multiple) {
            if (selected) {
                onChange((value || []).concat(i));
            } else {
                const index = _.findIndex(value, i);
                value.splice(index, 1);
                onChange(value);
            }
        } else if (selected) {
            onChange(i);
        } else {
            onChange(null);
        }
    };

    render() {
        const { renderRow, renderNoResults, filterItem, placeholder, style, keyExtractor } = this.props;
        const { search } = this.state;
        const data = filterItem ? _.filter(this.props.items, i => (
            !search || filterItem(i, search)
        )) : this.props.items;

        return (
            <Flex style={[Styles.body, { style }]}>
                {
                    filterItem
                    && (
                        <FormGroup>
                            <Container>
                                <ION name="ios-search" size={30} style={{ position: 'absolute', left: 10, color: pallette.greyMid, top: 10 }} />
                                <TextInput
                                  placeholder={placeholder}
                                  onChangeText={search => this.setState({ search: search.toLowerCase() })}
                                  style={Styles.searchInputText}
                                />
                            </Container>
                        </FormGroup>
                    )
                }
                {
                    data && data.length ? (
                        <FlatList
                          data={data}
                          renderItem={({ item, index }) => {
                              const isSelected = this.props.isSelected ? this.props.isSelected(item, this.props.value, this.props.multiple) : this.isSelected(item);
                              const toggleItem = () => {
                                  this.setItem(item, !isSelected);
                              };
                              return renderRow(item, isSelected, toggleItem);
                          }}
                          keyExtractor={keyExtractor || ((item, index) => index)}
                        />
                    ) : renderNoResults ? renderNoResults()
                        : (
                            <Text style={Styles.textCenter}>
                                No Results Found for:
                                <Bold>{search}</Bold>
                            </Text>
                        )
                }

            </Flex>
        );
    }
};

Select.propTypes = {
    value: propTypes.any,
    items: propTypes.any,
    multiple: propTypes.bool,
    filterItem: propTypes.func,
    renderRow: propTypes.func,
    placeholder: propTypes.string,
    searchTestID: propTypes.string,
    renderNoResults: propTypes.func,
    keyExtractor: propTypes.func,

};

module.exports = Select;
