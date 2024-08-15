import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useCreateRecord = () => {
  // const dispatch = useDispatch();
  const handleCreate = async (props) => {
    //   const token = localStorage.getItem("token");

    try {
      const response = await axios.post(props.apiRoute, props.data, {
        //   headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.code === 200) {
        //   dispatch(
        //     showSnackbar({ message: "Created Successfuly", severity: "success" })
        //   );
        return response.data.data;
      } else {
        //   dispatch(
        //     showSnackbar({
        //       message: "An error occurred while creating record",
        //       severity: "error",
        //     })
        //   );
        throw new Error("An error occurred while creating record.");
      }
    } catch (error) {
      // dispatch(
      //   showSnackbar({
      //     message: `${error.response?.data?.message}`,
      //     severity: "error",
      //   })
      // );
      throw new Error(`${error.response?.data?.message}`);
    }
  };

  return useMutation(handleCreate);
};
