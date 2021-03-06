import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * MenuLink class
 */
class MenuLink extends Component {
  /**
   * render
   * @return {XML}
   */
  render() {
    const item = this.props.item;

    return (

      <li className="menu-item">
        {(item.link.url.indexOf('http') !== -1) ?
          <a href={item.link.url} target="_blank">{item.link.title}</a> :
          <a href={this.props.baseUrl + item.link.url}>{item.link.title}</a>}
      </li>

    );
  }
}

MenuLink.propTypes = {
  baseUrl: PropTypes.string.isRequired,
  item: PropTypes.object.isRequired,
};

export default MenuLink;
