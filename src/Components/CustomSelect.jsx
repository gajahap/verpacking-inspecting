import React from "react";
import Select from "react-select";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: state.isDisabled ? "#f2f2f2" : (state.isFocused ? "#f6f5f5" : "#f6f5f5"),
    borderColor: state.isFocused ? "#660033" : "black",
    borderWidth: 2,
    boxShadow: state.isFocused ? "none" : null,
    "&:hover": {
      borderColor: "black",
    },
    borderRadius: "7px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#660033"
      : state.data.isImportant
      ? "#ffefef"
      : "#fff",
    cursor: "pointer",
    color: state.isFocused ? "#fff" : "#000",
    "&:active": {
      backgroundColor: "#be1640",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#000",
  }),
};

const filterOption = (option, inputValue) => {
  // Case-sensitive comparison
  return option.label.includes(inputValue);
};

const CustomSelect = ({
  value,
  options,
  onChange,
  placeholder = "Select an option...",
  isDisabled = false,
  name
}) => {
  return (
    <Select
      name={name}
      value={value}
      options={options}
      styles={customStyles}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      filterOption={filterOption} // ⬅️ Tambahkan ini
    />
  );
};

export default CustomSelect;
