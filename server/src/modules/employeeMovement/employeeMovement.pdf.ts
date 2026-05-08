import PDFDocument from "pdfkit";

export const generateEmployeeMovementPDF = async ({
  movement,
  res,
}: {
  movement: any;
  res: any;
}) => {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  const movementType = movement?.movementType || "";

  const employeeName = movement?.snapshot?.employeeName || "";

  const employeeId = movement?.snapshot?.employeeId || "";

  const effectiveDate = movement?.effectiveDate
    ? new Date(movement.effectiveDate).toDateString()
    : "";

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `inline; filename=${movementType}-${employeeId}.pdf`,
  );

  doc.pipe(res);

  /*
    ---------------------------------------------------
    HEADER
    ---------------------------------------------------
  */

  doc.fontSize(20).text("CHAKDA STEEL & RE-ROLLING MILLS (PVT.) LTD.", {
    align: "center",
  });

  doc.moveDown(0.5);

  doc.fontSize(14).text("HR & ADMIN DEPARTMENT", {
    align: "center",
  });

  doc.moveDown(1.5);

  /*
    ---------------------------------------------------
    TITLE
    ---------------------------------------------------
  */

  const titleMap: Record<string, string> = {
    increment: "INCREMENT LETTER",

    promotion: "PROMOTION LETTER",

    transfer: "TRANSFER ORDER",

    salary_revision: "SALARY REVISION LETTER",

    designation_change: "DESIGNATION CHANGE LETTER",

    department_change: "DEPARTMENT CHANGE LETTER",

    branch_transfer: "BRANCH TRANSFER LETTER",
  };

  doc.fontSize(16).text(titleMap[movementType] || "EMPLOYEE MOVEMENT LETTER", {
    align: "center",
    underline: true,
  });

  doc.moveDown(2);

  /*
    ---------------------------------------------------
    BASIC INFO
    ---------------------------------------------------
  */

  doc.fontSize(12).text(`Employee ID : ${employeeId}`);

  doc.moveDown(0.5);

  doc.text(`Employee Name : ${employeeName}`);

  doc.moveDown(0.5);

  doc.text(`Movement Type : ${movementType}`);

  doc.moveDown(0.5);

  doc.text(`Effective Date : ${effectiveDate}`);

  doc.moveDown(1);

  /*
    ---------------------------------------------------
    MOVEMENT DETAILS
    ---------------------------------------------------
  */

  if (
    movement?.snapshot?.fromDesignation?.name ||
    movement?.snapshot?.toDesignation?.name
  ) {
    doc.text(
      `Previous Designation : ${
        movement?.snapshot?.fromDesignation?.name || "-"
      }`,
    );

    doc.moveDown(0.5);

    doc.text(
      `New Designation : ${movement?.snapshot?.toDesignation?.name || "-"}`,
    );

    doc.moveDown(1);
  }

  if (
    movement?.snapshot?.fromDepartment?.name ||
    movement?.snapshot?.toDepartment?.name
  ) {
    doc.text(
      `Previous Department : ${
        movement?.snapshot?.fromDepartment?.name || "-"
      }`,
    );

    doc.moveDown(0.5);

    doc.text(
      `New Department : ${movement?.snapshot?.toDepartment?.name || "-"}`,
    );

    doc.moveDown(1);
  }

  if (
    movement?.snapshot?.fromBranch?.name ||
    movement?.snapshot?.toBranch?.name
  ) {
    doc.text(
      `Previous Branch : ${movement?.snapshot?.fromBranch?.name || "-"}`,
    );

    doc.moveDown(0.5);

    doc.text(`New Branch : ${movement?.snapshot?.toBranch?.name || "-"}`);

    doc.moveDown(1);
  }

  if (
    movement?.snapshot?.fromSalary?.grossSalary ||
    movement?.snapshot?.toSalary?.grossSalary
  ) {
    doc.text(
      `Previous Gross Salary : ${
        movement?.snapshot?.fromSalary?.grossSalary || 0
      }`,
    );

    doc.moveDown(0.5);

    doc.text(
      `New Gross Salary : ${movement?.snapshot?.toSalary?.grossSalary || 0}`,
    );

    doc.moveDown(1);
  }

  /*
    ---------------------------------------------------
    BODY
    ---------------------------------------------------
  */

  doc.moveDown(1);

  doc.text(
    `This office order is issued as per management approval and company HR policy. The above-mentioned employee movement will be effective from ${effectiveDate}.`,
    {
      align: "justify",
    },
  );

  doc.moveDown(3);

  /*
    ---------------------------------------------------
    SIGNATURE
    ---------------------------------------------------
  */

  doc.text("Authorized Signature", {
    align: "right",
  });

  doc.moveDown(0.5);

  doc.text("Manager (HR & Admin)", {
    align: "right",
  });

  doc.end();
};
