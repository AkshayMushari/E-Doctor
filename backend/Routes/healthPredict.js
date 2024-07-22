import express from "express";
import { spawn } from "child_process";

const router = express.Router({ mergeParams: true });

const pythonScriptPathForSymptoms = 'C:\\Akshay\\AI-MedLab-main\\backend\\symptoms.py';
const symptomsModel = "C:\\Akshay\\AI-MedLab-main\\backend\\aimodels\\svc.pkl";

router.post("/symptoms", (req, res) => {
  let responseSent = false; // Flag to track if response has been sent
  try {
    const data = req.body.data;
    const dataString = JSON.stringify({ data });

    console.log({ dataInString: dataString });

    const pythonProcess = spawn("python", [
      pythonScriptPathForSymptoms,
      "--loads",
      symptomsModel,
      dataString,
    ]);

    let prediction;

    pythonProcess.stdout.on("data", (data) => {
      const dataString = data.toString();
      console.log("Python script output:", dataString);
      try {
        prediction = JSON.parse(dataString);
      } catch (error) {
        console.error("Error parsing Python script output:", error);
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("Python script error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
      console.log("Python process closed with code:", code);
      if (!responseSent) {
        if (prediction) {
          res.json({ data: prediction });
        } else {
          res.status(500).send("Internal Server Error: Invalid prediction data");
        }
        responseSent = true;
      }
    });

    pythonProcess.on("error", (error) => {
      console.error("Python process error:", error);
      if (!responseSent) {
        res.status(500).send("Internal Server Error");
        responseSent = true;
      }
    });

  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      res.status(500).send("Internal Server Error");
      responseSent = true;
    }
  }
});

export default router;
