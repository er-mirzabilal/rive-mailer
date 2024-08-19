import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateRecord = () => {
  const handleCreate = async (props) => {
    try {
      const response = await axios.post(props.apiRoute, props.data, {});

      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error("An error occurred while creating record.");
      }
    } catch (error) {
      throw new Error(`${error.response?.data?.message}`);
    }
  };

  return useMutation(handleCreate);
};

export const useUpdateRecord = () => {
  const handleUpdate = async (props) => {
    try {
      const response = await axios.put(props.apiRoute, props.data, {});

      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error("An error occurred while creating record.");
      }
    } catch (error) {
      throw new Error(`${error.response?.data?.message}`);
    }
  };

  return useMutation(handleUpdate);
};

export const useDeleteRecord = () => {
  const handleDelete = async (props) => {
    try {
      const response = await axios.delete(props.apiRoute, null, {});

      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error("An error occurred while creating record.");
      }
    } catch (error) {
      throw new Error(`${error.response?.data?.message}`);
    }
  };

  return useMutation(handleDelete);
};
