import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import './SchoolsLookUp.scss';

const SHOW_EDCO_LOOKUP = 'SHOW_EDCO_LOOKUP';
const SHOW_MANUAL_LOOKUP = 'SHOW_MANUAL_LOOKUP';
const HIDE_LOOKUP = 'HIDE_LOOKUP';

class SchoolsLookUp extends Component {
  /**
   * Render menu item children.
   * @param option
   * @return {XML}
   */
  static renderMenuItemChildren(option) {
    return (
      <div key={option.id}>
        <span>{option.name}</span>
        {option.post_code ?
          <span>, {option.post_code}</span>:
          null
        }
      </div>
    );
  }

  /**
   * SchoolsLookUp constructor.
   * @param {object} props
   */
  constructor(props) {
    super(props);
    const { selectedEstablishment, establishmentNameValue } = props;
    let lookup;
    if (selectedEstablishment && selectedEstablishment.id) {
      lookup = HIDE_LOOKUP;
    } else if (establishmentNameValue || this.hasError(props)) {
      lookup = SHOW_MANUAL_LOOKUP;
    } else {
      lookup = SHOW_EDCO_LOOKUP;
    }
    this.state = {
      options: [],
      query: '',
      isSearching: false,
      isDefaultOptionHighlighted: true,
      lookup,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleLookup = this.handleLookup.bind(this);
    this.handleManual = this.handleManual.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleDefaultOptionHoverOff = this.handleDefaultOptionHoverOff.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderMenu = this.renderMenu.bind(this);
    this.renderSingleInput = this.renderSingleInput.bind(this);
    this.renderEstablishmentDetails = this.renderEstablishmentDetails.bind(this);
  }

  /**
   * Component lifecycle event triggered whenever props change
   * @param {object} props
   */
  componentWillReceiveProps(nextProps) {
    if (this.hasError(nextProps)) {
      this.handleLookup(SHOW_MANUAL_LOOKUP);
    }
  }

  /**
   * Check whether any field has error or all are valid
   * @param {object} props
   * @return {boolean}
   */
  hasError(props) {
    const { establishmentNameErrorMessage, address1ErrorMessage, address2ErrorMessage,
      address3ErrorMessage, townErrorMessage, postcodeErrorMessage } = props;
    const hasError = establishmentNameErrorMessage || address1ErrorMessage || address2ErrorMessage ||
      address3ErrorMessage || townErrorMessage || postcodeErrorMessage;
    return Boolean(hasError);
  }

  /**
   * Handle click event.
   * @param {string} lookup
   * @param {object} event
   */
  handleLookup(lookup, event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({ lookup });
  }

  /**
   * Handle search event.
   * @param {string} query
   */
  handleSearch(query) {
    if (!query) {
      return;
    }
    this.setState({ isSearching: true });
    axios.get(this.props.data + query)
      .then((response) => {
        const options = response.data.data.schools;
        this.setState({ query, options, isSearching: false });
      });
  }

  /**
   * Handle change event.
   * @param data
   */
  handleChange(data) {
    if (!data || !data[0] || data[0].id === 0) {
      return;
    }
    const {
      selectedEstablishmentIdentifier,
      establishmentIdIdentifier,
      establishmentNameIdentifier,
      address1Identifier,
      address2Identifier,
      address3Identifier,
      townIdentifier,
      postcodeIdentifier,
      onChange,
    } = this.props;
    const selectedEstablishment = data[0];
    onChange(selectedEstablishmentIdentifier, { target: { value: selectedEstablishment } });
    const mappedData = {
      [establishmentIdIdentifier]: selectedEstablishment.id,
      [establishmentNameIdentifier]: selectedEstablishment.name,
      [address1Identifier]: selectedEstablishment.address_1,
      [address2Identifier]: selectedEstablishment.address_2,
      [address3Identifier]: selectedEstablishment.address_3,
      [townIdentifier]: selectedEstablishment.town,
      [postcodeIdentifier]: selectedEstablishment.post_code,
    };
    Object.keys(mappedData).forEach((identifier) => {
      onChange(identifier, { target: { value: mappedData[identifier] } });
    });
    // display selection and reset fetched schools
    this.setState({ lookup: HIDE_LOOKUP, isDefaultOptionHighlighted: false });
  }

  /**
   * Handle change event.
   * @param {string} identifier
   * @param {object} event
   */
  handleManual(identifier, event) {
    const { onChange, establishmentIdIdentifier,
      establishmentIdValue, selectedEstablishmentIdentifier } = this.props;
    // reset selected school on manual entry
    if (establishmentIdValue) {
      onChange(establishmentIdIdentifier, { target: { value: '' } });
      onChange(selectedEstablishmentIdentifier, { target: { value: {} } });
    }
    onChange(identifier, event);
  }

  /**
   * Handle blur event.
   * @param {string} identifier
   */
  handleBlur(identifier) {
    const {
      validateField,
    } = this.props;
    if (validateField) {
      validateField(identifier);
    }
  }

  /**
   * Handle changing text value inside search box
   * @param {string} query
   */
  handleInputChange(query) {
    this.setState({ query, isDefaultOptionHighlighted: true });
  }

  /**
   * Handle hovering off default option
   */
  handleDefaultOptionHoverOff() {
    this.setState({ isDefaultOptionHighlighted: false });
  }

  /**
   * Render single input
   * @param {string} labelText
   * @param {string} identifier
   * @param {string} value
   * @param {string} errorMessage
   * @param {boolean} required
   * @param {boolean} readOnly
   * @return {XML}
   */
  renderSingleInput(labelText, identifier, value, errorMessage, required, readOnly) {
    // avoid rendering read only with empty value
    if (readOnly === true && !value) {
      return null;
    }
    return (
      <div className={`${readOnly === false && errorMessage ? 'validation__wrapper': ''}`}>
        {readOnly === false ?
          <div>
            <label htmlFor={identifier} className={`${required === true ? 'required' : ''}`}>{labelText}</label>
            <input
              id={identifier}
              name={identifier}
              value={value}
              type="text"
              onChange={event => this.handleManual(identifier, event)}
              onBlur={event => this.handleBlur(identifier, event)}
              required={required}
            />
            {errorMessage ?
              <div className="validation__message">
                <span>
                  {errorMessage}
                </span>
              </div>:
              null
            }
          </div>:
          <p>{value}</p>
        }
      </div>
    );
  }

  /**
   * Render establishment details inputs whether read only or not
   * @param  {object} establishmentDetails
   * @param  {boolean} readOnly
   * @return {XML}
   */
  renderEstablishmentDetails(establishmentDetails, readOnly) {
    const {
      establishmentNameLabelText, establishmentNameIdentifier, establishmentNameErrorMessage, establishmentNameRequired,
      address1LabelText, address1Identifier, address1ErrorMessage, address1Required,
      address2LabelText, address2Identifier, address2ErrorMessage, address2Required,
      address3LabelText, address3Identifier, address3ErrorMessage, address3Required,
      townLabelText, townIdentifier, townErrorMessage, townRequired,
      postcodeRequired, postcodeLabelText, postcodeIdentifier, postcodeErrorMessage,
    } = this.props;

    return (
      <div className="schoolDetails">
        {this.renderSingleInput(
          establishmentNameLabelText,
          establishmentNameIdentifier,
          establishmentDetails[establishmentNameIdentifier],
          establishmentNameErrorMessage,
          establishmentNameRequired,
          readOnly,
        )}

        {this.renderSingleInput(
          address1LabelText,
          address1Identifier,
          establishmentDetails[address1Identifier],
          address1ErrorMessage,
          address1Required,
          readOnly,
        )}

        {this.renderSingleInput(
          address2LabelText,
          address2Identifier,
          establishmentDetails[address2Identifier],
          address2ErrorMessage,
          address2Required,
          readOnly,
        )}

        {this.renderSingleInput(
          address3LabelText,
          address3Identifier,
          establishmentDetails[address3Identifier],
          address3ErrorMessage,
          address3Required,
          readOnly,
        )}

        {this.renderSingleInput(
          townLabelText,
          townIdentifier,
          establishmentDetails[townIdentifier],
          townErrorMessage,
          townRequired,
          readOnly,
        )}

        {this.renderSingleInput(
          postcodeLabelText,
          postcodeIdentifier,
          establishmentDetails[postcodeIdentifier],
          postcodeErrorMessage,
          postcodeRequired,
          readOnly,
        )}
      </div>
    );
  }

  /**
   * Render whole menu
   * Render default option and search results
   * Render nothing in case searching is still in progress
   * @param  {object} results
   * @param  {object} menuProps
   * @return {XML}
   */
  renderMenu(results, menuProps) {
    const { isSearching, isDefaultOptionHighlighted } = this.state;
    // do not show results until search is complete
    if (menuProps.emptyLabel === 'Searching...' || isSearching === true || results.length === 0
    ) {
      return <div />;
    }
    const MenuHeader = props => <li {...props} className={isDefaultOptionHighlighted ? 'default-selection' : ''} />;
    return (
      <Menu {...menuProps}>
        {results.length > 0 ?
          <div>
            <MenuHeader key="defaultSelection" onMouseLeave={this.handleDefaultOptionHoverOff}>
              Please select a school from the list below
            </MenuHeader>
            {
              results.map((result, index) => (
                <div key={index} onMouseEnter={this.handleDefaultOptionHoverOff}>
                  <MenuItem option={result} position={index}>
                    {SchoolsLookUp.renderMenuItemChildren(result)}
                  </MenuItem>
                </div>
              ))
            }
          </div>:
          null
        }
      </Menu>
    );
  }

  /**
   * Render Component.
   * @return {XML}
   */
  render() {
    const {
      establishmentNameValue, address1Value, address2Value, address3Value, townValue, postcodeValue,
      establishmentNameIdentifier, address1Identifier, address2Identifier, address3Identifier,
      townIdentifier, postcodeIdentifier, min, selectedEstablishment, disabled,
    } = this.props;
    const { lookup, options, isSearching, query } = this.state;
    const orEnterManuallyCopy = 'Or enter details manually';

    return (
      <div className="SchoolsLookUp">
        <p className="schoolsLookUp-title">
          <label htmlFor="schoolsLookUp">{'Enter the name or postcode of your school or nursery'}</label>
        </p>
        {lookup === HIDE_LOOKUP ?
          <div>
            {this.renderEstablishmentDetails(
              {
                [establishmentNameIdentifier]: selectedEstablishment.name,
                [address1Identifier]: selectedEstablishment.address_1,
                [address2Identifier]: selectedEstablishment.address_2,
                [address3Identifier]: selectedEstablishment.address_3,
                [townIdentifier]: selectedEstablishment.town,
                [postcodeIdentifier]: selectedEstablishment.post_code,
              },
              true,
            )}
            <button name="edit" className="SchoolsLookUp-link" onClick={this.handleLookup.bind(this, SHOW_MANUAL_LOOKUP)}>
              Edit
            </button>
          </div>:
          <div className="schoolsLookUp-search">
            {/* Disable caching as it ignores a lot of results */}
            <AsyncTypeahead
              type="text"
              minLength={min}
              bsSize="large"
              emptyLabel=""
              onSearch={this.handleSearch}
              onChange={this.handleChange}
              onInputChange={this.handleInputChange}
              className="schoolsLookUpForm"
              labelKey={option => `${option.id !== 0 ? `${option.name} ${option.post_code}` : ''}`}
              placeholder="Type to start search"
              renderMenu={this.renderMenu}
              options={options}
              useCache={false}
              disabled={disabled}
              filterBy={() => true}
            />
            {isSearching ?
              <Icon name="spinner" spin />:
              null
            }
            {!isSearching && query.length > min && options.length === 0 ?
              <p className="font--red">
                {"Sorry, we can't find this. If the school or postcode you entered is correct then please add the address manually below."}
              </p>:
              null
            }
          </div>
        }
        {lookup === SHOW_EDCO_LOOKUP ?
          <button name="enterManually" className="SchoolsLookUp-link" onClick={this.handleLookup.bind(this, SHOW_MANUAL_LOOKUP)}>
            {orEnterManuallyCopy}
          </button>:
          null
        }
        {lookup === SHOW_MANUAL_LOOKUP ?
          <div className="SchoolsLookUp-maunal">
            <p>{orEnterManuallyCopy}</p>
            {this.renderEstablishmentDetails(
              {
                [establishmentNameIdentifier]: establishmentNameValue,
                [address1Identifier]: address1Value,
                [address2Identifier]: address2Value,
                [address3Identifier]: address3Value,
                [townIdentifier]: townValue,
                [postcodeIdentifier]: postcodeValue,
              },
              false,
            )}
          </div>:
          null
        }
      </div>
    );
  }
}

SchoolsLookUp.defaultProps = {
  selectedEstablishmentIdentifier: 'selectedEstablishment',
  selectedEstablishment: {},
  establishmentIdIdentifier: 'establishmentId',
  establishmentNameLabelText: 'Establishment name',
  establishmentNameIdentifier: 'establishmentName',
  establishmentNameErrorMessage: '',
  establishmentNameRequired: true,
  address1LabelText: 'Address line 1',
  address1Identifier: 'address1',
  address1ErrorMessage: '',
  address1Required: true,
  address2LabelText: 'Address line 2',
  address2Identifier: 'address2',
  address2ErrorMessage: '',
  address2Required: false,
  address3LabelText: 'Address line 3',
  address3Identifier: 'address3',
  address3ErrorMessage: '',
  address3Required: false,
  townLabelText: 'Town',
  townIdentifier: 'town',
  townErrorMessage: '',
  townRequired: true,
  postcodeLabelText: 'Postcode',
  postcodeIdentifier: 'postcode',
  postcodeErrorMessage: '',
  postcodeRequired: true,
  disabled: false,
  validateField: () => {},
};

SchoolsLookUp.propTypes = {
  data: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  establishmentIdValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  establishmentNameValue: PropTypes.string.isRequired,
  address1Value: PropTypes.string.isRequired,
  address2Value: PropTypes.string.isRequired,
  address3Value: PropTypes.string.isRequired,
  townValue: PropTypes.string.isRequired,
  postcodeValue: PropTypes.string.isRequired,
  selectedEstablishmentIdentifier: PropTypes.string,
  selectedEstablishment: PropTypes.object,
  establishmentIdIdentifier: PropTypes.string,
  establishmentNameLabelText: PropTypes.string,
  establishmentNameRequired: PropTypes.bool,
  establishmentNameIdentifier: PropTypes.string,
  establishmentNameErrorMessage: PropTypes.string,
  address1LabelText: PropTypes.string,
  address1Required: PropTypes.bool,
  address1Identifier: PropTypes.string,
  address1ErrorMessage: PropTypes.string,
  address2LabelText: PropTypes.string,
  address2Required: PropTypes.bool,
  address2Identifier: PropTypes.string,
  address2ErrorMessage: PropTypes.string,
  address3LabelText: PropTypes.string,
  address3Required: PropTypes.bool,
  address3Identifier: PropTypes.string,
  address3ErrorMessage: PropTypes.string,
  townLabelText: PropTypes.string,
  townRequired: PropTypes.bool,
  townIdentifier: PropTypes.string,
  townErrorMessage: PropTypes.string,
  postcodeLabelText: PropTypes.string,
  postcodeRequired: PropTypes.bool,
  postcodeIdentifier: PropTypes.string,
  postcodeErrorMessage: PropTypes.string,
  validateField: PropTypes.func,
  disabled: PropTypes.bool,
};

export default SchoolsLookUp;
