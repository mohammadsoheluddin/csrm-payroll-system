export type TGender = "male" | "female" | "other";
export type TEmployeeStatus = "active" | "inactive";

export interface TEmployeeName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TEmployee {
  employeeId: string;
  user?: string;
  name: TEmployeeName;
  email: string;
  phone: string;
  gender: TGender;
  dateOfBirth?: string;
  joiningDate: string;
  designation: string;
  department: string;
  branch: string;
  basicSalary: number;
  status: TEmployeeStatus;
  isDeleted?: boolean;
}
