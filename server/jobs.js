var _ = require('underscore');


var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

var Job = Parse.Object.extend("Job");

// TODO load more jobs from different APIs
function getJobs() {
    var data = {
        method: 'GET',
        url: 'https://jobs.github.com/positions.json',
        params: {
            description: 'software engineer',
            location: 'san francisco'
        },
        headers: {
            'User-Agent': 'Parse.com Cloud Code'
        }
    };
    return Parse.Cloud.httpRequest(data);
}
function getEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi).join('; ');
}

function saveJob(jobData) {
    var contact = getEmails(JSON.stringify(jobData));
    if (contact && contact.length) {
        var job = new Job();
        job.setACL(restrictedAcl);
        job.contact = contact;
        job.data = jobData;
        return job.save(null, {useMasterKey: true});
    }
}

function saveJobs(jobs) {
    var jobsPromises = _.map(jobs, saveJob);
    _.remove(jobsPromises, _.isUndefined);
    return jobsPromises;
}

Parse.Cloud.job('getJobs', function (request, status) {
    // Set up to modify user data
    Parse.Cloud.useMasterKey();
    getJobs().then(saveJobs).then(function () {
        // Set the job's success status
        status.success("Migration completed successfully.");
    }, function (error) {
        // Set the job's error status
        status.error("Uh oh, something went wrong.");
    });
});