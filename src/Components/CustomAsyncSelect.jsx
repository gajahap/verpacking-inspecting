import React from "react";
import AsyncSelect from "react-select/async";

const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isDisabled ? "#f2f2f2" : state.isFocused ? "#f6f5f5" : "#f6f5f5",
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
        : state.data.isImportant // Warna dinamis berdasarkan opsi
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

const CustomAsyncSelect = ({
  value,
  loadOptions, // Use loadOptions instead of options
  onChange,
  placeholder = "Select an option...",
  isDisabled = false,
}) => {
  return (
    <AsyncSelect
      value={value}
      loadOptions={loadOptions} // Use this for dynamic options loading
      styles={customStyles}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      cacheOptions
      defaultOptions // Preload default options
    />
  );
};

export default CustomAsyncSelect;
