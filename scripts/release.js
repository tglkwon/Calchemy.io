import { execSync } from 'child_process';

const run = (cmd) => {
    try {
        console.log(`\n🚀 Executing: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`\n❌ Failed to execute: ${cmd}`);
        process.exit(1);
    }
};

// 1. Get commit message from CLI arguments
const msgArg = process.argv.slice(2).join(' ');
const commitMsg = msgArg.trim() || `site update: ${new Date().toISOString().slice(0, 10)}`;

console.log("=========================================");
console.log(" Calchemy.io Git Push & Deploy Pipeline ");
console.log("=========================================");
console.log(`* Commit Message: "${commitMsg}"`);

// 2. Git Add
run('git add .');

// 3. Check if there are changes staged for commit
let hasChanges = false;
try {
    // git diff-index will return exit code 1 if there are staged changes
    execSync('git diff-index --quiet --cached HEAD');
    console.log("➜ No staged changes found to commit.");
} catch (e) {
    hasChanges = true;
}

// 4. Git Commit (only if there are changes)
if (hasChanges) {
    // Escape double quotes in commit message for safe shell execution
    const escapedMsg = commitMsg.replace(/"/g, '\\"');
    run(`git commit -m "${escapedMsg}"`);
}

// 5. Git Push to remote master
run('git push origin master');

// 6. Deploy to GitHub Pages (npm run deploy)
run('npm run deploy');

console.log("\n=========================================");
console.log(" 🎉 Push & Deployment Completed Successfully!");
console.log("=========================================");
