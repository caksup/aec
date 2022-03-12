//these codes will generate 10 random questions out of 20
//and display them in a group of html documents


function displayQuiz(){
	document.getElementById('instructions').style.display = "none"
	document.getElementById('Quiz').style.display = "flex"
	//prototype to create new Quiz
	function Quiz(question, answer, correct){
		this.question = question
		this.answer = answer
		this.correct = correct
	}
	//20 questions that will use the prototype
	// koma \' (jawaban 0-3)
	var q1 = new Quiz(
			'Glad',
			['Senang', 'Sedih', 'Suka', 'Payah'],
			0
		)
	var q2 = new Quiz(
			'Happy',
			['suka', 'bahagia', 'seperti', 'gembira'],
			1
		)
	var q3 = new Quiz(
			'Depressed',
			['tekanan', 'menekan', 'tertekan', 'tertentu'],
			2
		)
	var q4 = new Quiz(
			'Cheerful',
			['Cemburu', 'Cemberut', 'Cemas', 'Ceria'],
			3
		)
	var q5 = new Quiz(
			'Sad',
			['Senang', 'sendiri', 'semangat', 'sedih'],
			3
		)
	var q6 = new Quiz(
			'Feel up set',
			['secara', 'sebel', 'segan', 'sabar'],
			1
		)
	var q7 = new Quiz(
			'Angry',
			['ramah', 'marah', 'sabar', 'tamah'],
			1
		)
	var q8 = new Quiz(
			'Afraid',
			['takut', 'kecewa', 'marah', 'berani'],
			0
		)
	var q9 = new Quiz(
			'Proud',
			['bagai', 'bahagia', 'bangga', 'bagus'],
			2
		)
	var q10 = new Quiz(
			'Curious',
			['Tahu', 'Serius', 'Sering', 'Penasaran'],
			3
		)
	var q11 = new Quiz(
			'Eager',
			['bersabar', 'berada', 'berharap', 'bersemangat'],
			3
		)
	var q12 = new Quiz(
			'Lazy',
			['mudah', 'tenang', 'malas', 'lemah'],
			2
		)
	var q13 = new Quiz(
			'Jealous',
			['Cerewet', 'jempolan', 'jelas', 'cemburu'],
			3
		)
	var q14 = new Quiz(
			'Enthusiastic',
			['Andalan', 'Antik', 'Antisias', 'Antusias'],
			3
		)
	var q15 = new Quiz(
			'Feeling bad',
			['gak enak hati', 'gak enakan', 'gak enak diri', 'gak enak rasa'],
			0
		)
	var q16 = new Quiz(
			'Hesitate',
			['wagu', 'bangga', 'tenang', 'ragu'],
			3
		)
	var q17 = new Quiz(
			'Brave',
			['takut', 'berani', 'sendiri', 'semangat'],
			1
		)
	var q18 = new Quiz(
			'Confuse',
			['berani', 'lalai', 'linglung', 'bingung'],
			3
		)
	var q19 = new Quiz(
			'Absent minded',
			['linglung', 'lalai', 'berani', 'bingung'],
			0
		)
	var q20 = new Quiz(
			'Fall in love',
			['cinta sejati', 'cinta terjatuh', 'cinta jatuh', 'jatuh cinta'],
			3
		)

	//storing all the new methods in an array
	var Questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18, q19, q20]

	//function to shuffle the Questions array
	var shuffleArray = function(arr){
		var newPos,
			temp
		for(i = arr.length - 1; i > 0; i--){
			newPos = Math.floor(Math.random() * (i + 1))
			temp = arr[i]
			arr[i] = arr[newPos]
			arr[newPos] = temp
		}
		return arr
	}
	shuffleArray(Questions)
	// console.log(shuffleArray(Questions))

	//function to display the shuffled Questions array to the html
	Quiz.prototype.displayQuestions = function(arr){
		for(i = 0; i < 10; i++){
			let x = i + 1
			document.getElementById(`q${x}`).innerHTML = arr[i].question
		}
	}(Questions)

	Quiz.prototype.sortAnswers = function(arr){
		let answerHolder = []
		for(i = 0; i < 10; i++){
			for(j = 0; j < 4; j++){
				answerHolder.push(arr[i].answer[j])
			}
		}
		// console.log(answerHolder)
		return answerHolder
	}(Questions)

	function displayAnswers(arr){
		for(i = 0; i < arr.length; i++){
			document.getElementById(`a${i + 1}`).innerHTML = arr[i]
		}
	}
	displayAnswers(Quiz.prototype.sortAnswers)

	// console.log(Quiz.prototype.sortAnswers)
	// console.log(Questions)

	document.getElementById('submitQuiz').onclick = function(){
		Quiz.prototype.checkAnswer = function(arr){
			var score = 0
			for(i = 0; i < 10; i++){
				for(j = 0; j < 4; j++){
					var x = document.getElementById(`q${i + 1}rd${j + 1}`)
					x.disabled = true
					if(x.checked == true && j == arr[i].correct){
						score ++
						x.parentNode.style.backgroundColor = '#66ff66'
						x.previousElementSibling.innerHTML = '&#160&#10004'
					}else if(x.checked == true && j != arr[i].correct){
						x.parentNode.style.backgroundColor = '#ffb3b3'
						x.previousElementSibling.innerHTML = '&#160&#10006'
					}else if(j == arr[i].correct){
						x.parentNode.style.backgroundColor = '#b3ffb3'
					}
				}
			}
			console.log(score)
			document.getElementById('score').innerHTML = `${score}/10`
		}(Questions)
		document.getElementById('submitQuiz').style.display = "none"
		document.getElementById('retryQuiz').style.display = "flex"
		document.documentElement.scrollTop = 0
		document.getElementById('score-box').style.display = "flex"
		document.getElementById('result-txt').style.display = "flex"
	}
}
// if(j == arr[i].correct){
// 	document.getElementById(`q${i + 1}rd${j + 1}`).parentNode.style.backgroundColor = '#99ff99'
// }
// document.getElementById(`q${i + 1}rd${j + 1}`).parentNode.style.backgroundColor = '#99ff99'
// document.getElementById('q1rd1').parentNode.style.backgroundColor = 'pink'
// console.log(arr[0].question, arr[0].answer, arr[0].correct)


















