# js chess bot

this is the old js version i built, now ported to Golang for concurrency and speed: https://github.com/0hq/chess-engine-golang    

logic files held in js/rewrite.js and the version i wrote in 4 hours for a competition is js/will.js

Quiescence search has been removed temporarily so it kind of sucks.

- [x] Depth-first search.  
- [x] Alpha/beta pruning.  
- [x] Move ordering.  
- [x] Piece position evaluation.  
- [x] Iterative Deepening.  
- [x] Memoization / Transposition Tables.  

- [ ] Parallelization   
- [ ] Monte Carlo Tree Search?  
- [ ] MTD(f) or PVS search style?  
- [ ] Fix weird illegal move issue
- [ ] Move storage
- [ ] Better move ordering
- [ ] Razoring?

want to test it out?  
https://0hq.github.io/chess-ai/  
