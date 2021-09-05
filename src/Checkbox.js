import React from "react";

const Checkbox = ({ label, param,
  isSelected, onCheckboxChange }) => (

  <label>
    <input
      className="mr-1"
      type="checkbox"
      name={param}
      checked={isSelected}
      onChange={onCheckboxChange}
    />
    {label}
  </label>
);

export default Checkbox;