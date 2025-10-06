import AddNewStudentRegister from "@/components/students/register-student";

const StudentRegister = async ({ searchParams }) => {
  const searchParamsObj = await new Promise((resolve) => {
    resolve(searchParams);
  });

  return (
    <>
      <AddNewStudentRegister
        getBearerToken={searchParamsObj?.bearer_token}
        getUUIDToken={searchParamsObj?.token}
      />
    </>
  );
};

export default StudentRegister;
