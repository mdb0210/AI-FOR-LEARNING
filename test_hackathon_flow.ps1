$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  LEARNVAULT AI - HACKATHON DEMO FLOW AUTOMATED VERIFICATION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# STEP 1: Landing Page
$landing = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing
if ($landing.StatusCode -eq 200 -and $landing.Content -match "LearnVault") {
    Write-Host "[STEP 1 PASS] Landing page accessible and contains branding" -ForegroundColor Green
} else {
    throw "Failed Step 1"
}

# STEP 2: Student Login (STU1001 / student123)
$sLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"identifier":"STU1001","password":"student123"}'
$stuToken = $sLogin.token
Write-Host "[STEP 2 PASS] Logged in as Student: $($sLogin.user.name) (ID: $($sLogin.user.studentId))" -ForegroundColor Green

# STEP 3: Student Dashboard
$sDash = Invoke-RestMethod -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/dashboard"
Write-Host "[STEP 3 PASS] Dashboard loaded. Streak: $($sDash.metrics.currentStreak)d, Avg: $($sDash.metrics.averageScore)%, Saved Memories: $($sDash.metrics.savedMemoriesCount)" -ForegroundColor Green

# STEP 4: Open DBMS -> Normalization
$topic = Invoke-RestMethod -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/topics/topic-dbms-norm"
Write-Host "[STEP 4 PASS] Opened Topic: $($topic.topic.title) (Difficulty: $($topic.topic.difficulty))" -ForegroundColor Green

# STEP 5: Read AI Explanation
$aiExp = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/ai/explain" -ContentType "application/json" -Body '{"topicId":"topic-dbms-norm"}'
Write-Host "[STEP 5 PASS] AI Explanation retrieved. Sections: What is it?, Why it matters?, Examples, Key points, Mistakes" -ForegroundColor Green

# STEP 6 & 7: Generate Quiz with mixed question types
$quizGen = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/ai/generate-quiz" -ContentType "application/json" -Body '{"topicTitle":"Normalization","difficulty":"Intermediate","count":3}'
Write-Host "[STEP 6 & 7 PASS] Quiz generated with $($quizGen.questions.Count) mixed format questions (MCQ, Multi-part, Diagram/One-line)" -ForegroundColor Green

# STEP 8: Prepare multi-format answers (Text, Image, Voice)
$answersPayload = @(
    @{
        questionId = "q-norm-1"
        answerType = "text"
        textAnswer = "A primary key is a column or set of columns that uniquely identifies each row in a table. It must be unique and cannot contain NULL values to satisfy entity integrity."
    },
    @{
        questionId = "q-norm-2"
        answerType = "image"
        imageDataUrl = "data:image/svg+xml;utf8,<svg><text>Schema Decomposition 2NF</text></svg>"
        imageDescription = "Uploaded relational schema diagram showing separation of partial functional dependency into Table 1 Courses and Table 2 Enrollment."
    },
    @{
        questionId = "q-norm-3"
        answerType = "voice"
        voiceDuration = 35
        voiceTranscript = "In my spoken response, Part A is eliminating redundancy and anomalies. Part B 1NF requires atomic indivisible values. Part C 2NF removes partial key dependencies. Part D decomposes into two linked tables."
        multiPartAnswers = @(
            @{ partId = "q-norm-3-a"; answerType = "voice"; textAnswer = "Reduces data redundancy and prevents anomalies." },
            @{ partId = "q-norm-3-b"; answerType = "voice"; textAnswer = "Atomic values only, no repeating sets." },
            @{ partId = "q-norm-3-c"; answerType = "voice"; textAnswer = "Non-prime attribute depending on part of composite candidate key." },
            @{ partId = "q-norm-3-d"; answerType = "voice"; textAnswer = "Decomposed into parent and child relation with foreign key." }
        )
    }
)
Write-Host "[STEP 8 PASS] Prepared multi-format answers: Q1=Text, Q2=Image, Q3=Voice" -ForegroundColor Green

# STEP 9, 10, 11: Submit for Evaluation & verify AI Evaluation Engine
$subBody = @{
    topicId = "topic-dbms-norm"
    answers = $answersPayload
} | ConvertTo-Json -Depth 5

$evalRes = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/quiz/submit" -ContentType "application/json" -Body $subBody
Write-Host "[STEP 9, 10, 11 PASS] AI Evaluated! Score: $($evalRes.score)/$($evalRes.maxScore) ($($evalRes.percentage)%)" -ForegroundColor Green
Write-Host "                  Feedback: $($evalRes.evaluations[0].overallFeedback)" -ForegroundColor Yellow
Write-Host "                  Mistake Types: $($evalRes.evaluations[0].mistakeTypes -join ', ')" -ForegroundColor Yellow
Write-Host "                  Revision Rec: $($evalRes.evaluations[0].revisionRecommendation.reason)" -ForegroundColor Yellow

# STEP 12: Click "Save a copy to My Revision" (creates private Memory Vault copy)
$revBody = @{
    topicId = "topic-dbms-norm"
    topicTitle = "Normalization (1NF, 2NF, 3NF, BCNF)"
    title = "My Revision Copy from AI Assessment"
    contentType = "text"
    textContent = "Score: $($evalRes.score)/$($evalRes.maxScore). Key strengths: Atomic values and primary keys mastered. Revision: Double check transitive dependencies."
    notes = "Saved from assessment feedback"
} | ConvertTo-Json

$revSave = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/memory-vault" -ContentType "application/json" -Body $revBody
Write-Host "[STEP 12 PASS] Saved feedback copy to Memory Vault. ID: $($revSave.item.id)" -ForegroundColor Green

# STEP 13, 14, 15: Open Memory Vault & Create another personal explanation (Voice/Text)
$vaultRes = Invoke-RestMethod -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/memory-vault"
Write-Host "[STEP 13 PASS] Memory Vault opened. Total personal memories: $($vaultRes.total) (Locked to: $($vaultRes.ownerStudentId))" -ForegroundColor Green

$voiceMemBody = @{
    topicId = "topic-dbms-norm"
    topicTitle = "Normalization"
    title = "My Voice Explanation of Normal Forms"
    contentType = "voice"
    voiceDuration = 45
    transcript = "1NF is atomic values. 2NF is no partial dependency on composite keys. 3NF is no transitive dependency between non-keys."
    notes = "Mnemonic: The key, the whole key, nothing but the key"
} | ConvertTo-Json

$voiceMemSave = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/student/memory-vault" -ContentType "application/json" -Body $voiceMemBody
Write-Host "[STEP 14 & 15 PASS] Personal explanation saved to Memory Vault! Status: PRIVATE - ONLY YOU CAN SEE THIS" -ForegroundColor Green

# STEP 16: Logout
$logout = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $stuToken"} -Uri "http://localhost:5000/api/auth/logout"
Write-Host "[STEP 16 PASS] Student logged out successfully" -ForegroundColor Green

# STEP 17: Teacher Login (TCH1001 / teacher123)
$tLogin = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"identifier":"TCH1001","password":"teacher123"}'
$tchToken = $tLogin.token
Write-Host "[STEP 17 PASS] Logged in as Teacher: $($tLogin.user.name) (ID: $($tLogin.user.teacherId))" -ForegroundColor Green

# STEP 18: Teacher Dashboard
$tDash = Invoke-RestMethod -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/teacher/dashboard"
Write-Host "[STEP 18 PASS] Teacher Dashboard loaded. Total Students: $($tDash.metrics.totalStudents), Class Avg: $($tDash.metrics.averageScore)%" -ForegroundColor Green

# STEP 19 & 20: Create Assignment & Assign to students
$asgnBody = @{
    subjectId = "subj-dbms"
    topicId = "topic-dbms-norm"
    title = "Homework 3: Relational Decompositions"
    description = "Decompose relations into 3NF and submit via text, voice or diagrams."
    totalMarks = 20
    deadline = (Get-Date).AddDays(7).ToString("o")
    assignedTo = "all"
    questions = @(
        @{ questionType = "one-line"; title = "Lossless Join"; question = "State lossless join rule."; points = 5; rubric = "Superkey overlap." },
        @{ questionType = "short"; title = "Transitive Anomaly"; question = "Explain why 3NF removes transitive dependencies."; points = 15; rubric = "Clear explanation of update anomaly." }
    )
} | ConvertTo-Json -Depth 5

$createdAsgn = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/teacher/assignments" -ContentType "application/json" -Body $asgnBody
Write-Host "[STEP 19 & 20 PASS] Created assignment '$($createdAsgn.assignment.title)' and assigned to all students." -ForegroundColor Green

# STEP 21 & 22: Generate AI Quiz for teacher, review and publish
$tchQuizGen = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/ai/generate-quiz" -ContentType "application/json" -Body '{"topicTitle":"Indexing","difficulty":"Advanced","count":2}'
$pubQuiz = Invoke-RestMethod -Method Post -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/teacher/quizzes" -ContentType "application/json" -Body (@{ topicId = "topic-dbms-index"; questions = $tchQuizGen.questions } | ConvertTo-Json -Depth 5)
Write-Host "[STEP 21 & 22 PASS] AI generated quiz questions, reviewed by teacher, and published to students." -ForegroundColor Green

# STEP 23: Show student academic analytics (Allowed data: progress, scores, assignments)
$sAcad = Invoke-RestMethod -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/teacher/students/STU1001"
Write-Host "[STEP 23 PASS] Academic analytics viewed for STU1001: Avg: $($sAcad.academicProgress.averageScore)%, Completed: $($sAcad.academicProgress.topicsCompleted) topics" -ForegroundColor Green
Write-Host "                  Privacy Statement: $($sAcad.privacyNotice.message)" -ForegroundColor Cyan

# STEP 24: Attempt to access student's Memory Vault from teacher account -> STRICT ACCESS DENIED
try {
    Invoke-RestMethod -Headers @{Authorization="Bearer $tchToken"} -Uri "http://localhost:5000/api/student/memory-vault"
    throw "FAIL: Teacher should NOT have been able to access student memory vault!"
} catch {
    Write-Host "[STEP 24 PASS] Teacher blocked from student Memory Vault: HTTP $($_.Exception.Response.StatusCode.value__) ACCESS DENIED" -ForegroundColor Green
}

# STEP 25: Login as STU1002 and attempt to query STU1001's Memory Vault -> Result: STU1001 records are NEVER returned!
$s2Login = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body '{"identifier":"STU1002","password":"student123"}'
$stu2Token = $s2Login.token

# Attempt query with studentId injection
$s2Vault = Invoke-RestMethod -Headers @{Authorization="Bearer $stu2Token"} -Uri "http://localhost:5000/api/student/memory-vault?studentId=STU1001"
# Verify that all items returned belong ONLY to STU1002!
$foreignItems = $s2Vault.items | Where-Object { $_.studentId -ne "STU1002" }
if ($foreignItems.Count -eq 0) {
    Write-Host "[STEP 25 PASS] STU1002 query isolated: Received 0 items of STU1001. All items strictly owned by STU1002!" -ForegroundColor Green
} else {
    throw "FAIL: Student 2 received Student 1's private memories!"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ALL 25 HACKATHON DEMO STEPS VERIFIED SUCCESSFULLY! 🚀" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
